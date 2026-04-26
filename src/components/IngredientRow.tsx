import { useEffect, useRef, type DragEvent, type KeyboardEvent } from 'react'
import type { Ingredient } from '../types'
import { UNIT_GROUPS, getUnitType } from '../lib/units'

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
  const quantityRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusOnMount) quantityRef.current?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (p: Partial<Ingredient>) => onChange({ ...ingredient, ...p })

  const handleUnitSelect = (value: string) => {
    if (value === '') patch({ unit: undefined, unitType: 'none' })
    else if (value === '__custom__') patch({ unit: '', unitType: 'custom' })
    else patch({ unit: value, unitType: getUnitType(value) })
  }

  const next = (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); onAddAfter() } }

  const isCustom = ingredient.unitType === 'custom'
  const selectVal = isCustom ? '__custom__' : (ingredient.unit ?? '')

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
        ref={quantityRef}
        type="number"
        min="0"
        step="any"
        value={ingredient.quantity ?? ''}
        onChange={e => patch({ quantity: e.target.value === '' ? undefined : Number(e.target.value) })}
        onKeyDown={next}
        aria-label="Quantity"
        placeholder="qty"
        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />

      <select
        value={selectVal}
        onChange={e => handleUnitSelect(e.target.value)}
        aria-label="Unit"
        className="border border-gray-300 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
      >
        <option value="">—</option>
        {UNIT_GROUPS.map(g => (
          <optgroup key={g.label} label={g.label}>
            {g.units.map(u => <option key={u} value={u}>{u}</option>)}
          </optgroup>
        ))}
        <option value="__custom__">custom…</option>
      </select>

      {isCustom && (
        <input
          type="text"
          value={ingredient.unit ?? ''}
          onChange={e => patch({ unit: e.target.value })}
          onKeyDown={next}
          aria-label="Custom unit"
          placeholder="unit"
          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      )}

      <input
        type="text"
        value={ingredient.name}
        onChange={e => patch({ name: e.target.value })}
        onKeyDown={next}
        aria-label="Ingredient name"
        placeholder="ingredient name"
        className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />

      <input
        type="text"
        value={ingredient.note ?? ''}
        onChange={e => patch({ note: e.target.value || undefined })}
        onKeyDown={next}
        aria-label="Note"
        placeholder="note"
        className={`${isCustom ? 'w-20' : 'w-28'} border border-gray-300 rounded px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
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
