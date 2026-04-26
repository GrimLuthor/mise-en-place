import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useRecipe } from '../hooks/useRecipes'
import { useRecipeImages } from '../hooks/useImages'
import { useDragSort } from '../hooks/useDragSort'
import { db } from '../db/db'
import { getToken } from '../store/authStore'
import { syncAllToDrive } from '../lib/drive'
import TagInput from '../components/TagInput'
import IngredientRow from '../components/IngredientRow'
import StepRow from '../components/StepRow'
import ImageUpload from '../components/ImageUpload'
import type { Ingredient, Step, Recipe, RecipeImage } from '../types'

interface FormState {
  title: string
  description: string
  tags: string[]
  ingredients: Ingredient[]
  steps: Step[]
  servings: string
  prepTime: string
  cookTime: string
  sourceUrls: string[]
  notes: string
}

const emptyForm = (): FormState => ({
  title: '', description: '', tags: [], ingredients: [], steps: [],
  servings: '', prepTime: '', cookTime: '', sourceUrls: [], notes: '',
})

const recipeToForm = (r: Recipe): FormState => ({
  title: r.title,
  description: r.description,
  tags: r.tags,
  ingredients: r.ingredients,
  steps: r.steps,
  servings: r.servings?.toString() ?? '',
  prepTime: r.prepTime?.toString() ?? '',
  cookTime: r.cookTime?.toString() ?? '',
  sourceUrls: r.sourceUrls ?? [],
  notes: r.notes ?? '',
})

const newIngredient = (): Ingredient => ({ id: uuidv4(), name: '', unitType: 'none' })
const newStep = (): Step => ({ id: uuidv4(), text: '' })

export default function RecipeEdit() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === undefined
  const navigate = useNavigate()

  const existingRecipe = useRecipe(id)
  const existingImages = useRecipeImages(isNew ? undefined : id)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [images, setImages] = useState<RecipeImage[]>([])
  const [initialized, setInitialized] = useState(isNew)
  const [imagesReady, setImagesReady] = useState(isNew)
  const [focusIngId, setFocusIngId] = useState<string | null>(null)
  const [focusStepId, setFocusStepId] = useState<string | null>(null)
  const [titleError, setTitleError] = useState(false)

  useEffect(() => {
    if (initialized) return
    if (existingRecipe === null) { navigate('/'); return }
    if (existingRecipe) { setForm(recipeToForm(existingRecipe)); setInitialized(true) }
  }, [existingRecipe, initialized, navigate])

  useEffect(() => {
    if (imagesReady || existingImages === undefined) return
    setImages(existingImages)
    setImagesReady(true)
  }, [existingImages, imagesReady])

  const setIngredients = (ingredients: Ingredient[]) => setForm(f => ({ ...f, ingredients }))
  const setSteps = (steps: Step[]) => setForm(f => ({ ...f, steps }))
  const ingDrag = useDragSort(form.ingredients, setIngredients)
  const stepDrag = useDragSort(form.steps, setSteps)

  const addIngredientAfter = (index: number) => {
    const ing = newIngredient()
    setIngredients([...form.ingredients.slice(0, index + 1), ing, ...form.ingredients.slice(index + 1)])
    setFocusIngId(ing.id)
  }

  const addStepAfter = (index: number) => {
    const step = newStep()
    setSteps([...form.steps.slice(0, index + 1), step, ...form.steps.slice(index + 1)])
    setFocusStepId(step.id)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setTitleError(true); return }
    const now = Date.now()
    const recipe: Recipe = {
      id: existingRecipe?.id ?? uuidv4(),
      title: form.title.trim(),
      description: form.description,
      tags: form.tags,
      ingredients: form.ingredients,
      steps: form.steps,
      servings: form.servings ? Number(form.servings) : undefined,
      prepTime: form.prepTime ? Number(form.prepTime) : undefined,
      cookTime: form.cookTime ? Number(form.cookTime) : undefined,
      sourceUrls: form.sourceUrls.filter(u => u.trim()),
      notes: form.notes || undefined,
      createdAt: existingRecipe?.createdAt ?? now,
      updatedAt: now,
    }
    const deletedImageIds = (existingImages ?? [])
      .filter(ei => !images.find(i => i.id === ei.id))
      .map(ei => ei.id)

    await db.recipes.put(recipe)
    await db.images.where('recipeId').equals(recipe.id).delete()
    if (images.length > 0) {
      await db.images.bulkAdd(images.map((img, i) => ({ ...img, recipeId: recipe.id, order: i })))
    }
    const token = getToken()
    if (token) syncAllToDrive(token, deletedImageIds).catch(() => {})
    navigate(`/recipe/${recipe.id}`)
  }

  if (!initialized || !imagesReady) return <p className="p-12 text-center text-gray-400">Loading…</p>

  const recipeId = existingRecipe?.id ?? ''

  const field = (label: string, children: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to={isNew ? '/' : `/recipe/${id}`} className="text-sm text-emerald-600 hover:text-emerald-800">
            ← {isNew ? 'Gallery' : 'Back'}
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">{isNew ? 'New Recipe' : 'Edit Recipe'}</h1>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            {field('Title *',
              <input type="text" value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setTitleError(false) }}
                placeholder="Recipe name"
                className={`${inputCls} ${titleError ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              />
            )}
            {titleError && <p className="text-xs text-red-500 -mt-2">Title is required.</p>}

            {field('Description',
              <textarea value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="A short description…" rows={3} className={`${inputCls} resize-none`} />
            )}

            {field('Tags', <TagInput tags={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />)}

            <div className="grid grid-cols-3 gap-3">
              {field('Servings', <input type="number" min="1" value={form.servings}
                onChange={e => setForm(f => ({ ...f, servings: e.target.value }))} placeholder="4" className={inputCls} />)}
              {field('Prep (min)', <input type="number" min="0" value={form.prepTime}
                onChange={e => setForm(f => ({ ...f, prepTime: e.target.value }))} placeholder="15" className={inputCls} />)}
              {field('Cook (min)', <input type="number" min="0" value={form.cookTime}
                onChange={e => setForm(f => ({ ...f, cookTime: e.target.value }))} placeholder="30" className={inputCls} />)}
            </div>

            {field('Source URLs',
              <div className="space-y-2">
                {form.sourceUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={e => {
                        const next = [...form.sourceUrls]
                        next[i] = e.target.value
                        setForm(f => ({ ...f, sourceUrls: next }))
                      }}
                      placeholder="https://…"
                      className={`${inputCls} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, sourceUrls: f.sourceUrls.filter((_, j) => j !== i) }))}
                      aria-label="Remove URL"
                      className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, sourceUrls: [...f.sourceUrls, ''] }))}
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  + Add URL
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Photos</h2>
            <ImageUpload recipeId={recipeId} images={images} onChange={setImages} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Ingredients</h2>
            <div className="space-y-2">
              {form.ingredients.map((ing, i) => (
                <IngredientRow key={ing.id} ingredient={ing}
                  onChange={updated => setIngredients(form.ingredients.map((x, j) => j === i ? updated : x))}
                  onDelete={() => setIngredients(form.ingredients.filter((_, j) => j !== i))}
                  onAddAfter={() => addIngredientAfter(i)}
                  onDragStart={ingDrag.onDragStart(i)} onDragOver={ingDrag.onDragOver(i)} onDrop={ingDrag.onDrop}
                  focusOnMount={focusIngId === ing.id} isDragging={ingDrag.dragIdx === i}
                />
              ))}
            </div>
            <button type="button" onClick={() => addIngredientAfter(form.ingredients.length - 1)}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-800 font-medium">
              + Add ingredient
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Steps</h2>
            <div className="space-y-2">
              {form.steps.map((step, i) => (
                <StepRow key={step.id} step={step} index={i}
                  onChange={updated => setSteps(form.steps.map((x, j) => j === i ? updated : x))}
                  onDelete={() => setSteps(form.steps.filter((_, j) => j !== i))}
                  onAddAfter={() => addStepAfter(i)}
                  onDragStart={stepDrag.onDragStart(i)} onDragOver={stepDrag.onDragOver(i)} onDrop={stepDrag.onDrop}
                  focusOnMount={focusStepId === step.id} isDragging={stepDrag.dragIdx === i}
                />
              ))}
            </div>
            <button type="button" onClick={() => addStepAfter(form.steps.length - 1)}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-800 font-medium">
              + Add step
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {field('Personal notes',
              <textarea value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Substitutions, tips, what to do differently next time…"
                rows={4} className={`${inputCls} resize-none`} />
            )}
          </div>

          <div className="flex gap-3 pb-6">
            <button type="button" onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Save Recipe
            </button>
            <Link to={isNew ? '/' : `/recipe/${id}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
