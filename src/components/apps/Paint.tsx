import { useRef, useState, type PointerEvent } from 'react'

export function Paint() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(3)
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'line' | 'rectangle' | 'ellipse' | 'fill' | 'text'>('pencil')
  const [drawing, setDrawing] = useState(false)
  const origin = useRef({ x: 0, y: 0 })
  const point = (event: PointerEvent) => {
    const element = canvas.current
    if (!element || !drawing || !['pencil', 'eraser'].includes(tool)) return
    const context = element.getContext('2d')
    if (!context) return
    const rect = element.getBoundingClientRect()
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top)
    context.stroke()
  }
  const start = (event: PointerEvent) => {
    const element = canvas.current
    const context = element?.getContext('2d')
    if (!element || !context) return
    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    origin.current = { x, y }
    if (tool === 'fill') { context.fillStyle = color; context.fillRect(0, 0, element.width, element.height); return }
    if (tool === 'text') { const text = window.prompt('Text:'); if (text) { context.fillStyle = color; context.font = `${Math.max(12, size * 5)}px Arial`; context.fillText(text, x, y) }; return }
    context.beginPath()
    context.moveTo(x, y)
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    context.lineWidth = size
    context.lineCap = 'round'
    setDrawing(true)
  }
  const end = (event: PointerEvent) => {
    const element = canvas.current
    const context = element?.getContext('2d')
    if (!element || !context || !drawing) return
    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (tool === 'line') { context.beginPath(); context.moveTo(origin.current.x, origin.current.y); context.lineTo(x, y); context.strokeStyle = color; context.stroke() }
    if (tool === 'rectangle') { context.strokeStyle = color; context.strokeRect(origin.current.x, origin.current.y, x - origin.current.x, y - origin.current.y) }
    if (tool === 'ellipse') { context.beginPath(); context.ellipse((origin.current.x + x) / 2, (origin.current.y + y) / 2, Math.abs(x - origin.current.x) / 2, Math.abs(y - origin.current.y) / 2, 0, 0, Math.PI * 2); context.strokeStyle = color; context.stroke() }
    setDrawing(false)
  }
  const clear = () => canvas.current?.getContext('2d')?.clearRect(0, 0, canvas.current.width, canvas.current.height)
  const save = () => { const anchor = document.createElement('a'); anchor.href = canvas.current?.toDataURL() ?? ''; anchor.download = 'untitled.bmp'; anchor.click() }
  return <div className="paint"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Image&nbsp;&nbsp; Help</div><div className="paint-toolbar"><label>Tool <select value={tool} onChange={(event) => setTool(event.target.value as typeof tool)}><option value="pencil">Pencil</option><option value="eraser">Eraser</option><option value="line">Line</option><option value="rectangle">Rectangle</option><option value="ellipse">Ellipse</option><option value="fill">Fill</option><option value="text">Text</option></select></label><label>Color <input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><label>Size <input type="range" min="1" max="18" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label><button onClick={clear}>Clear</button><button onClick={save}>Save BMP</button></div><canvas ref={canvas} width="470" height="210" onPointerDown={start} onPointerMove={point} onPointerUp={end} onPointerLeave={end} /></div>
}
