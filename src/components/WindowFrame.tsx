import { useRef } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { APP_META, type WindowState } from '../lib/os'

type Props = {
  state: WindowState
  active: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onMove: (x: number, y: number) => void
  onResize: (width: number, height: number) => void
  children: ReactNode
}

export function WindowFrame({ state, active, onFocus, onClose, onMinimize, onMaximize, onMove, onResize, children }: Props) {
  const drag = useRef<{ mode: 'move' | 'resize'; dx: number; dy: number; width: number; height: number } | null>(null)
  const onPointerMove = (event: PointerEvent) => {
    if (!drag.current || state.maximized) return
    if (drag.current.mode === 'resize') {
      onResize(Math.max(280, drag.current.width + event.clientX - drag.current.dx), Math.max(190, drag.current.height + event.clientY - drag.current.dy))
    } else {
      onMove(Math.max(8, event.clientX - drag.current.dx), Math.max(8, event.clientY - drag.current.dy))
    }
  }
  const beginDrag = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    drag.current = { mode: 'move', dx: event.clientX - state.x, dy: event.clientY - state.y, width: state.width, height: state.height }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  return (
    <section className={`window ${active ? 'active' : ''} ${state.maximized ? 'maximized' : ''}`}
      style={state.maximized
        ? { left: 0, top: 0, right: 0, bottom: 34, width: 'auto', height: 'auto', zIndex: state.z }
        : { left: state.x, top: state.y, width: state.width, height: state.height, zIndex: state.z }}
      onPointerDown={onFocus} onPointerMove={onPointerMove}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <header className="titlebar" onPointerDown={beginDrag}>
        <span>{APP_META[state.id].icon} {APP_META[state.id].title}</span>
        <div>
          <button aria-label="Minimize" onClick={onMinimize}>_</button>
          <button aria-label="Maximize" onClick={onMaximize}>□</button>
          <button aria-label="Close" onClick={onClose}>×</button>
        </div>
      </header>
      <div className="window-body">{children}</div>
      {!state.maximized && <div className="resize-grip" onPointerDown={(event) => {
        event.stopPropagation()
        drag.current = { mode: 'resize', dx: event.clientX, dy: event.clientY, width: state.width, height: state.height }
        event.currentTarget.setPointerCapture(event.pointerId)
      }} />}
    </section>
  )
}
