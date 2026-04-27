import { useState, type KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('')

  const commit = (value: string) => {
    const tag = value.trim().toLowerCase()
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(input)
    } else if (e.key === 'Backspace' && input === '') {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-input bg-input rounded-lg min-h-10 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 cursor-text">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-accent-tag text-accent-tag text-sm px-2 py-0.5 rounded-full">
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter(t => t !== tag))}
            aria-label={`Remove tag ${tag}`}
            className="text-accent hover:text-primary leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) commit(input) }}
        placeholder={tags.length === 0 ? 'Add tags (Enter or comma to confirm)…' : ''}
        className="flex-1 min-w-32 outline-none text-sm bg-transparent text-primary"
      />
    </div>
  )
}
