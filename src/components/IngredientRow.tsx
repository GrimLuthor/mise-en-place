import { useEffect, useRef, type DragEvent, type KeyboardEvent } from 'react'
import type { Ingredient } from '../types'

interface Props {
  ingredient: Ingredient
  onChange: (updated: Ingredient) => void
  onDelete: () => void
  onAddAfter: () => void
  onDragStart: () => void
  onDragOver: (e: DragEvent) => void
  onDrop: () => void
  focusOnMount?: boolean
  isDragging?: boolean
}

export default function IngredientRow({
  ingredient, onChange, onDelete, onAddAfter,
  onDragStart, onDragOver, onDrop, focusOnMount, isDragging,
}: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusOnMount) ref.current?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); onAddAfter() }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex items-center gap-2 p-2 rounded-lg border ${
        isDragging ? 'opacity-40 border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white'
      }`}
    >
      <span className="cursor-grab text-gray-300 hover:text-gray-500 select-none text-lg px-0.5" aria-hidden>⠿</span>
      <input
        ref={ref}
        type="text"
        value={ingredient.text}
        onChange={e => onChange({ ...ingredient, text: e.target.value })}
        onKeyDown={handleKeyDown}
        aria-label="Ingredient"
        placeholder="e.g. 200g flour"
        className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label="Remove ingredient"
        className="w-6 h-6 flex items-center justify-center shrink-0 text-gray-300 hover:text-red-500 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
