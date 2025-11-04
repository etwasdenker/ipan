import { ReactNode, useRef, useState, useEffect } from 'react'
import { Box } from '@mui/material'

type Props = {
  /** Левая колонка */
  left: ReactNode
  /** Правая колонка */
  right: ReactNode
  /** Начальная ширина левой колонки в px */
  initialLeft?: number
  /** Мин. ширина левой колонки в px */
  minLeft?: number
  /** Макс. ширина левой колонки в px */
  maxLeft?: number
  /** Высота панелей (по умолчанию — растягиваемся на всю высоту родителя) */
  height?: number | string
}

/**
 * Простой горизонтальный SplitPane:
 * левая колонка фиксируется в px, правая тянется; ручка перетаскивается.
 * Ручка сделана шириной 6px (по запросу), попадать в неё удобно.
 */
export default function SplitPane({
  left,
  right,
  initialLeft = 380,
  minLeft = 240,
  maxLeft = 800,
  height = '100%',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [leftPx, setLeftPx] = useState<number>(initialLeft)
  const dragRef = useRef<{ dragging: boolean; startX: number; startLeft: number }>({
    dragging: false,
    startX: 0,
    startLeft: initialLeft,
  })

  // сохранить последнюю ширину между маунтами страниц
  useEffect(() => {
    const key = 'ipan.splitpane.left'
    const saved = localStorage.getItem(key)
    if (saved) setLeftPx(Math.min(Math.max(parseInt(saved, 10), minLeft), maxLeft))
    return () => localStorage.setItem(key, String(leftPx))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return
      const dx = e.clientX - dragRef.current.startX
      let next = dragRef.current.startLeft + dx
      next = Math.max(minLeft, Math.min(maxLeft, next))
      setLeftPx(next)
    }
    const onUp = () => {
      dragRef.current.dragging = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [minLeft, maxLeft])

  const startDrag = (e: React.MouseEvent) => {
    dragRef.current.dragging = true
    dragRef.current.startX = e.clientX
    dragRef.current.startLeft = leftPx
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const HANDLE_W = 6

  return (
    <Box ref={containerRef} sx={{ position: 'relative', display: 'flex', height, minHeight: 0 }}>
      {/* Левая колонка */}
      <Box
        sx={{
          width: leftPx,
          minWidth: minLeft,
          maxWidth: maxLeft,
          borderRight: '2px solid',
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        {left}
      </Box>

      {/* Ручка */}
      <Box
        onMouseDown={startDrag}
        sx={{
          position: 'relative',
          width: HANDLE_W,
          cursor: 'col-resize',
          bgcolor: 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      />

      {/* Правая колонка */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{right}</Box>
    </Box>
  )
}
