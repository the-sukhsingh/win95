export type VfsFile = { name: string; type: 'file' | 'folder'; content?: string }

const STORAGE_KEY = 'win95.vfs'
const defaultFiles: VfsFile[] = [
  { name: 'README.TXT', type: 'file', content: 'Welcome to Windows 95 Web Edition!\r\n\r\nThis file lives in your browser virtual drive.' },
  { name: 'WEB95.URL', type: 'file', content: '[InternetShortcut]\r\nURL=https://github.com/' },
  { name: 'MINESW~1.EXE', type: 'file', content: 'Minesweeper application' },
  { name: 'MY DOCS', type: 'folder' },
]

export function listFiles(): VfsFile[] {
  if (typeof window === 'undefined') return defaultFiles
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) return defaultFiles
  try { return JSON.parse(saved) as VfsFile[] } catch { return defaultFiles }
}

export function readFile(name: string): string {
  return listFiles().find((file) => file.name.toLowerCase() === name.toLowerCase())?.content ?? ''
}

export function writeFile(name: string, content: string) {
  if (typeof window === 'undefined') return
  const files = listFiles()
  const existing = files.find((file) => file.name.toLowerCase() === name.toLowerCase())
  if (existing) existing.content = content
  else files.push({ name, type: 'file', content })
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
}
