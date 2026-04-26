import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRecipe } from '../hooks/useRecipes'
import { useWakeLock } from '../hooks/useWakeLock'

export default function CookingMode() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const recipe = useRecipe(id)

  useWakeLock()

  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {})
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) }
  }, [])

  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [activeStep, setActiveStep] = useState(0)

  const toggle = (ingId: string) => setChecked(prev => {
    const next = new Set(prev)
    next.has(ingId) ? next.delete(ingId) : next.add(ingId)
    return next
  })

  const handleExit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    navigate(`/recipe/${id}`)
  }

  if (recipe === undefined) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading…</div>
  )
  if (recipe === null) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Recipe not found.</div>
  )

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
        <h1 className="text-lg font-semibold truncate">{recipe.title}</h1>
        <button
          onClick={handleExit}
          className="ml-4 shrink-0 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Exit
        </button>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Ingredients + Steps ── */}
        <div className="flex-1 overflow-hidden flex flex-col md:grid md:grid-cols-2 md:divide-x md:divide-white/10">

          {/* Ingredients */}
          <section className="flex-1 overflow-hidden flex flex-col">
            <h2 className="shrink-0 text-xs font-semibold uppercase tracking-widest text-white/40 px-6 pt-6 pb-4">Ingredients</h2>
            <ul className="flex-1 overflow-y-auto px-6 pb-6">
              {recipe.ingredients.map(ing => {
                const isChecked = checked.has(ing.id)
                return (
                  <li key={ing.id}>
                    <label className={`flex items-start gap-3 px-2 py-3 rounded-xl cursor-pointer select-none min-h-[48px] transition-colors ${
                      isChecked ? 'opacity-40' : 'hover:bg-white/5'
                    }`}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggle(ing.id)} className="sr-only" />
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                      }`}>
                        {isChecked && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-base flex-1 leading-relaxed ${isChecked ? 'line-through' : ''}`}>
                        {ing.text}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Steps */}
          <section className="flex-1 overflow-hidden flex flex-col border-t border-white/10 md:border-t-0">
            <h2 className="shrink-0 text-xs font-semibold uppercase tracking-widest text-white/40 px-6 pt-6 pb-4">Steps</h2>
            <ol className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {recipe.steps.map((step, i) => (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(i)}
                    className={`w-full text-left flex gap-4 px-4 py-4 rounded-xl min-h-[48px] transition-colors ${
                      i === activeStep
                        ? 'bg-emerald-600 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={`font-bold text-lg w-6 shrink-0 leading-relaxed ${i === activeStep ? 'text-white' : 'text-emerald-500'}`}>
                      {i + 1}.
                    </span>
                    <span className="text-base leading-relaxed">{step.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

        </div>

        {/* ── Notes ── */}
        {recipe.notes && (
          <section className="shrink-0 max-h-[50vh] overflow-y-auto border-t border-white/10 px-6 py-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Notes</h2>
            <p className="text-base text-white/75 leading-relaxed whitespace-pre-wrap">{recipe.notes}</p>
          </section>
        )}

      </div>
    </div>
  )
}
