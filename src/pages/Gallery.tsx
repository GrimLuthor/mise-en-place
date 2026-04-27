import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useDriveSync } from '../hooks/useDriveSync'
import { useStorageSize } from '../hooks/useStorageSize'
import RecipeCard from '../components/RecipeCard'
import ThemeToggleButton from '../components/ThemeToggleButton'
import TimeRangeSlider, { TIME_MAX } from '../components/TimeRangeSlider'
import type { Recipe } from '../types'

interface MatchResult {
  rank: number
  matchLabel: string
}

function totalMinutes(r: Recipe) {
  return (r.prepTime ?? 0) + (r.cookTime ?? 0)
}

function getMatchResult(recipe: Recipe, q: string): MatchResult | null {
  if (!q) return { rank: 0, matchLabel: '' }
  const lq = q.toLowerCase()

  const titleHit = recipe.title.toLowerCase().includes(lq)
  const tagHit   = recipe.tags.some(t => t.includes(lq))
  const descHit  = recipe.description.toLowerCase().includes(lq)
  const ingHit   = recipe.ingredients.some(i => i.text.toLowerCase().includes(lq))
  const noteHit  = recipe.notes?.toLowerCase().includes(lq) ?? false

  if (!titleHit && !tagHit && !descHit && !ingHit && !noteHit) return null

  const primary = titleHit || tagHit
  const secondary = [
    descHit && 'description',
    ingHit  && 'ingredients',
    noteHit && 'notes',
  ].filter(Boolean) as string[]

  return {
    rank: primary ? 0 : 1,
    matchLabel: primary ? '' : `Found in ${secondary.join(' & ')}`,
  }
}

export default function Gallery() {
  const recipes = useRecipes()
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<[number, number]>([0, TIME_MAX])
  const [timeOn, setTimeOn] = useState(false)
  const { canInstall, install } = useInstallPrompt()
  const { isSignedIn, login, logout } = useGoogleAuth()
  const storageSize = useStorageSize()
  useDriveSync()

  const allTags = [...new Set(recipes?.flatMap(r => r.tags) ?? [])]

  const toggleTag = (tag: string) =>
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const withMatch = (recipes ?? [])
    .map(r => ({ r, match: getMatchResult(r, query) }))
    .filter(({ match, r }) => {
      if (match === null) return false
      if (activeTags.length > 0 && !activeTags.every(t => r.tags.includes(t))) return false
      if (timeOn) {
        const t = totalMinutes(r)
        if (t > 0 && (t < timeRange[0] || t > timeRange[1])) return false
      }
      return true
    })
    .sort((a, b) => a.match!.rank - b.match!.rank)

  return (
    <div className="min-h-screen bg-page">
      <header className="bg-header border-b border-header sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-2">

          {/* Search row */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-accent-dark shrink-0">Mise en Place</h1>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search recipes…"
              className="flex-1 min-w-0 border border-input bg-input text-primary rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {canInstall && (
              <button
                type="button"
                onClick={install}
                className="hidden sm:block shrink-0 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              >
                Install
              </button>
            )}
            {/* Auth button: desktop only */}
            {isSignedIn ? (
              <button
                type="button"
                onClick={logout}
                title="Signed in — click to sign out"
                className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs text-accent-dark font-medium px-2.5 py-1.5 rounded-full bg-accent-subtle hover:bg-accent-subtle-hover transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  <path d="M12 10v6m-3-3l3 3 3-3" />
                </svg>
                Synced
              </button>
            ) : (
              <button
                type="button"
                onClick={() => login()}
                title="Sign in with Google to sync recipes"
                className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs text-secondary font-medium px-2.5 py-1.5 rounded-full bg-surface hover:bg-surface-hover transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Sign in
              </button>
            )}
            <ThemeToggleButton />
          </div>

          {/* Tag pills + mobile auth */}
          <div className="flex flex-wrap items-center gap-1.5">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  activeTags.includes(tag)
                    ? 'bg-accent text-white'
                    : 'bg-surface text-secondary hover:bg-surface-hover'
                }`}
              >
                {tag}
              </button>
            ))}
            {/* Install + auth: mobile only */}
            <div className="sm:hidden ml-auto flex items-center gap-1.5">
              {canInstall && (
                <button
                  type="button"
                  onClick={install}
                  className="flex items-center gap-1 text-xs text-accent-dark font-medium px-2.5 py-1 rounded-full bg-accent-subtle hover:bg-accent-subtle-hover transition-colors"
                >
                  Install
                </button>
              )}
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1 text-xs text-accent-dark font-medium px-2.5 py-1 rounded-full bg-accent-subtle hover:bg-accent-subtle-hover transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    <path d="M12 10v6m-3-3l3 3 3-3" />
                  </svg>
                  Synced
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => login()}
                  className="flex items-center gap-1 text-xs text-secondary font-medium px-2.5 py-1 rounded-full bg-surface hover:bg-surface-hover transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Sign in
                </button>
              )}
            </div>
          </div>

          {/* Time range filter */}
          <div className="flex items-center gap-3 pb-1">
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={timeOn}
                onChange={e => setTimeOn(e.target.checked)}
                className="w-3.5 h-3.5 accent-sky-500"
              />
              <span className={`text-xs font-medium ${timeOn ? 'text-sky-600' : 'text-muted'}`}>
                Total time
              </span>
            </label>
            <div className={timeOn ? '' : 'opacity-40 pointer-events-none'}>
              <TimeRangeSlider value={timeRange} onChange={setTimeRange} />
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {recipes === undefined ? (
          <p className="text-center text-muted mt-24">Loading…</p>
        ) : withMatch.length === 0 ? (
          <p className="text-center text-muted mt-24">
            {recipes.length === 0 ? 'No recipes yet — add your first one!' : 'No recipes match your search.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {withMatch.map(({ r, match }) => (
              <RecipeCard key={r.id} recipe={r} matchLabel={match!.matchLabel} />
            ))}
          </div>
        )}
      </main>

      <Link
        to="/new"
        className="fixed bottom-6 right-6 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg px-5 py-3 text-sm font-medium transition-colors"
      >
        + New Recipe
      </Link>

      {storageSize && (
        <div className="fixed bottom-6 left-6 text-xs text-muted bg-card border border-card rounded-full px-3 py-1.5 shadow-sm select-none">
          {storageSize} stored
        </div>
      )}
    </div>
  )
}
