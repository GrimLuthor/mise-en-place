import { useEffect, useRef, type DragEvent, type KeyboardEvent } from 'react'
import type { Step } from '../types'

interface Props {
  step: Step
  index: number
  onChange: (updated: Step) => void
  onDelete: () => void
  onAddAfter: () => void
  onDragStart: () => void
  onDragOver: (e: DragEvent) => void
  onDrop: () => void
  focusOnMount?: boolean
  isDragging?: boolean
}

export default function StepRow({
  step, index, onChange, onDelete, onAddAfter,
  onDragStart, onDragOver, onDrop, focusOnMount, isDragging,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (focusOnMount) ref.current?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAddAfter()
    }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex items-start gap-2 p-2 rounded-lg border ${
        isDragging ? 'opacity-40 border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white'
      }`}
    >
      <span className="cursor-grab text-gray-300 hover:text-gray-500 select-none text-lg px-0.5 pt-1.5" aria-hidden>⠿</span>
      <span className="text-emerald-600 text-sm font-semibold pt-1.5 w-5 shrink-0">{index + 1}.</span>
      <textarea
        ref={ref}
        value={step.text}
        onChange={e => onChange({ ...step, text: e.target.value })}
        onKeyDown={handleKeyDown}
        aria-label={`Step ${index + 1}`}
        placeholder="Describe this step… (Enter for next step, Shift+Enter for new line)"
        rows={2}
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label="Remove step"
        className="w-6 h-6 flex items-center justify-center shrink-0 mt-1.5 text-gray-300 hover:text-red-500 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
