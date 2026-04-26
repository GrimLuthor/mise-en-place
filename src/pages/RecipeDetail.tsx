import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRecipe } from '../hooks/useRecipes'
import { useRecipeImages } from '../hooks/useImages'
import { db } from '../db/db'
import { getToken } from '../store/authStore'
import { syncToDrive } from '../lib/drive'
import ImageCarousel from '../components/ImageCarousel'
import type { Ingredient } from '../types'

function formatIngredient(ing: Ingredient): string {
  const parts: string[] = []
  if (ing.quantity != null) parts.push(String(ing.quantity))
  if (ing.unit) parts.push(ing.unit)
  parts.push(ing.name)
  if (ing.note) parts.push(`(${ing.note})`)
  return parts.join(' ')
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const recipe = useRecipe(id)
  const images = useRecipeImages(id)
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (!confirm(`Delete "${recipe?.title}"?`)) return
    await db.images.where('recipeId').equals(id!).delete()
    await db.recipes.delete(id!)
    const token = getToken()
    if (token) syncToDrive(token).catch(() => {})
    navigate('/')
  }

  if (recipe === undefined) return <p className="p-12 text-center text-gray-400">Loading…</p>
  if (recipe === null) return <p className="p-12 text-center text-gray-400">Recipe not found.</p>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-emerald-600 hover:text-emerald-800">
            ← Gallery
          </Link>
          <Link
            to={`/recipe/${recipe.id}/cook`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Cooking
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {images && images.length > 0 && (
            <div className="p-4 pb-0">
              <ImageCarousel images={images} />
            </div>
          )}
          <div className="p-6 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {recipe.tags.map(tag => (
                  <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {(recipe.servings || recipe.prepTime || recipe.cookTime) && (
            <div className="flex gap-4 text-sm text-gray-500 pt-1 border-t">
              {recipe.servings && <span>Serves {recipe.servings}</span>}
              {recipe.prepTime && <span>{recipe.prepTime} min prep</span>}
              {recipe.cookTime && <span>{recipe.cookTime} min cook</span>}
            </div>
          )}

          {recipe.description && (
            <p className="text-gray-700 border-t pt-4">{recipe.description}</p>
          )}

          {recipe.ingredients.length > 0 && (
            <section className="border-t pt-4">
              <h2 className="font-semibold text-gray-900 mb-3">Ingredients</h2>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {recipe.ingredients.map(ing => (
                  <li key={ing.id}>{formatIngredient(ing)}</li>
                ))}
              </ul>
            </section>
          )}

          {recipe.steps.length > 0 && (
            <section className="border-t pt-4">
              <h2 className="font-semibold text-gray-900 mb-3">Steps</h2>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={step.id} className="flex gap-3 text-sm text-gray-700">
                    <span className="font-semibold text-emerald-600 shrink-0 w-5">{i + 1}.</span>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {recipe.notes && (
            <section className="border-t pt-4">
              <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{recipe.notes}</p>
            </section>
          )}

          {(recipe.sourceUrls ?? []).length > 0 && (
            <section className="border-t pt-4">
              <h2 className="font-semibold text-gray-900 mb-2">Sources</h2>
              <ul className="space-y-1">
                {(recipe.sourceUrls ?? []).map((url, i) => (
                  <li key={i}>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline break-all">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex items-center gap-3 border-t pt-4">
            <Link
              to={`/recipe/${recipe.id}/edit`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Delete
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
