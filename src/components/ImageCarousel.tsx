import { useState, type TouchEvent } from 'react'
import { useObjectUrls } from '../hooks/useObjectUrls'
import type { RecipeImage } from '../types'

interface Props {
  images: RecipeImage[]
}

export default function ImageCarousel({ images }: Props) {
  const [index, setIndex] = useState(0)
  const [touchX, setTouchX] = useState<number | null>(null)
  const getUrl = useObjectUrls(images)

  if (images.length === 0) return null

  const safeIndex = Math.min(index, images.length - 1)
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setIndex(i => (i + 1) % images.length)

  const onTouchStart = (e: TouchEvent) => setTouchX(e.touches[0].clientX)
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX === null) return
    const diff = touchX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setTouchX(null)
  }

  const url = getUrl(images[safeIndex].id)

  return (
    <div
      className="relative bg-gray-100 rounded-xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {url
        ? <img src={url} alt={`Image ${safeIndex + 1} of ${images.length}`} className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gray-200" />
      }

      {images.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={next} aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Image ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${i === safeIndex ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
