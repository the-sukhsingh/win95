import { useRef, useState, type PointerEvent } from 'react'

export function Paint() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(3)
  const [drawing, setDrawing] = useState(false)
  const point = (event: PointerEvent) => {
    const element = canvas.current
    if (!element) return
    const context = element.getContext('2d')
    if (!context) return
    const rect = element.getBoundingClientRect()
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top)
    context.stroke()
  }
  const start = (event: PointerEvent) => {
    const context = canvas.current?.getContext('2d')
    if (!context) return
    const rect = canvas.current!.getBoundingClientRect()
    context.beginPath()
    context.moveTo(event.clientX - rect.left, event.clientY - rect.top)
    context.strokeStyle = color
    context.lineWidth = size
    context.lineCap = 'round'
    setDrawing(true)
  }
  const clear = () => canvas.current?.getContext('2d')?.clearRect(0, 0, canvas.current.width, canvas.current.height)
  const save = () => { const anchor = document.createElement('a'); anchor.href = canvas.current?.toDataURL() ?? ''; anchor.download = 'untitled.bmp'; anchor.click() }
  return <div className="paint"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Image&nbsp;&nbsp; Help</div><div className="paint-toolbar"><label>Color <input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><label>Brush <input type="range" min="1" max="18" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label><button onClick={clear}>Clear</button><button onClick={save}>Save</button></div><canvas ref={canvas} width="470" height="210" onPointerDown={start} onPointerMove={(event) => drawing && point(event)} onPointerUp={() => setDrawing(false)} onPointerLeave={() => setDrawing(false)} /></div>
}
