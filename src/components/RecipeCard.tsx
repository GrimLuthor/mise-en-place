import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCoverImage } from '../hooks/useImages'
import type { Recipe } from '../types'

interface Props {
  recipe: Recipe
  matchLabel?: string
}

export default function RecipeCard({ recipe, matchLabel }: Props) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)
  const coverImage = useCoverImage(recipe.id)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!coverImage?.blob) { setCoverUrl(null); return }
    const url = URL.createObjectURL(coverImage.blob)
    setCoverUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [coverImage])

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="block bg-card rounded-xl shadow-sm border border-card hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      <div className="h-36 bg-card-gradient flex items-center justify-center overflow-hidden">
        {coverUrl
          ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          : <span className="text-5xl select-none">🍳</span>
        }
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-primary truncate">{recipe.title}</h2>
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.map(tag => (
              <span key={tag} className="text-xs bg-accent-subtle text-accent-dark px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        {totalTime > 0 && (
          <p className="text-xs text-muted mt-2">{totalTime} min total</p>
        )}
        {matchLabel && (
          <p className="text-xs text-muted italic mt-2">{matchLabel}</p>
        )}
      </div>
    </Link>
  )
}
