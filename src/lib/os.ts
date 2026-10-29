export type AppId = 'computer' | 'notepad' | 'terminal' | 'minesweeper' | 'about' | 'paint' | 'solitaire' | 'internet-explorer'

export type WindowState = {
  id: AppId
  minimized: boolean
  maximized: boolean
  x: number
  y: number
  width: number
  height: number
  z: number
}

export type AppMeta = { title: string; icon: string }

export const APP_META: Record<AppId, AppMeta> = {
  computer: { title: 'My Computer', icon: '🖥️' },
  notepad: { title: 'Notepad', icon: '📝' },
  terminal: { title: 'MS-DOS Prompt', icon: '▣' },
  minesweeper: { title: 'Minesweeper', icon: '💣' },
  about: { title: 'Welcome to Windows 95', icon: '▤' },
  paint: { title: 'Paint', icon: '🎨' },
  solitaire: { title: 'Solitaire', icon: '🃏' },
  'internet-explorer': { title: 'Internet Explorer', icon: '🌐' },
}

export const DEFAULT_WINDOWS: WindowState[] = [{
  id: 'about',
  minimized: false,
  maximized: false,
  x: 360,
  y: 108,
  width: 500,
  height: 310,
  z: 5,
}]

export function loadWindows(): WindowState[] {
  if (typeof window === 'undefined') return DEFAULT_WINDOWS
  try {
    const saved = window.localStorage.getItem('win95.windows')
    if (!saved) return DEFAULT_WINDOWS
    const parsed = JSON.parse(saved) as WindowState[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_WINDOWS
    return parsed.map((item) => ({
      ...item,
      width: Math.min(760, Math.max(320, item.width || 500)),
      height: Math.min(560, Math.max(220, item.height || 310)),
      x: Math.max(8, item.x || 8),
      y: Math.max(8, item.y || 8),
    }))
  } catch {
    return DEFAULT_WINDOWS
  }
}

export function saveWindows(windows: WindowState[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('win95.windows', JSON.stringify(windows))
}

export function createWindow(id: AppId, index: number): WindowState {
  const offset = (index % 8) * 24
  return { id, minimized: false, maximized: false, x: 220 + offset, y: 68 + offset, width: 500, height: 310, z: Date.now() }
}
