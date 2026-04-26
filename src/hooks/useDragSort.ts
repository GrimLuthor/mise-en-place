import { useState } from 'react'
import type { DragEvent } from 'react'

export function useDragSort<T>(items: T[], onChange: (items: T[]) => void) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const onDragStart = (i: number) => () => setDragIdx(i)

  const onDragOver = (i: number) => (e: DragEvent) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    const next = [...items]
    const [item] = next.splice(dragIdx, 1)
    next.splice(i, 0, item)
    onChange(next)
    setDragIdx(i)
  }

  const onDrop = () => setDragIdx(null)

  return { dragIdx, onDragStart, onDragOver, onDrop }
}
