import { useRef, useState, type DragEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useDragSort } from '../hooks/useDragSort'
import { useObjectUrls } from '../hooks/useObjectUrls'
import type { RecipeImage } from '../types'

interface Props {
  recipeId: string
  images: RecipeImage[]
  onChange: (images: RecipeImage[]) => void
}

export default function ImageUpload({ recipeId, images, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dropping, setDropping] = useState(false)
  const drag = useDragSort(images, onChange)
  const getUrl = useObjectUrls(images)

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const next: RecipeImage[] = Array.from(files).map((file, i) => ({
      id: uuidv4(),
      recipeId,
      blob: file as Blob,
      order: images.length + i,
    }))
    onChange([...images, ...next])
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDropping(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => {
            const url = getUrl(img.id)
            return (
              <div
                key={img.id}
                draggable
                onDragStart={drag.onDragStart(i)}
                onDragOver={drag.onDragOver(i)}
                onDrop={drag.onDrop}
                className={`relative group w-24 h-24 rounded-lg overflow-hidden border-2 shrink-0 ${
                  drag.dragIdx === i ? 'opacity-40 border-emerald-400' : 'border-gray-200'
                }`}
              >
                {url
                  ? <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-100" />
                }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-1 text-white text-xs bg-black/40 rounded px-0.5 cursor-grab select-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ⠿
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDropping(true) }}
        onDragLeave={() => setDropping(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload images"
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dropping ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => addFiles(e.target.files)}
          className="hidden"
        />
        <p className="text-sm text-gray-500">
          Drop images here or <span className="text-emerald-600 font-medium">click to upload</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Drag thumbnails to reorder</p>
      </div>
    </div>
  )
}
