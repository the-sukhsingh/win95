export type VfsFile = { name: string; type: 'file' | 'folder'; content?: string; size?: number; modified?: string }
export type RecycleItem = VfsFile & { deletedAt: string }

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

export function saveFiles(files: VfsFile[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
}

export function createFile(name: string, type: VfsFile['type'] = 'file', content = '') {
  const files = listFiles()
  if (files.some((file) => file.name.toLowerCase() === name.toLowerCase())) return false
  files.push({ name, type, content: type === 'file' ? content : undefined, size: content.length, modified: new Date().toISOString() })
  saveFiles(files)
  return true
}

export function renameFile(oldName: string, newName: string) {
  const files = listFiles()
  const file = files.find((item) => item.name.toLowerCase() === oldName.toLowerCase())
  if (!file || files.some((item) => item.name.toLowerCase() === newName.toLowerCase())) return false
  file.name = newName
  file.modified = new Date().toISOString()
  saveFiles(files)
  return true
}

export function copyFile(sourceName: string, targetName = `${sourceName} - Copy`) {
  const files = listFiles()
  const source = files.find((item) => item.name.toLowerCase() === sourceName.toLowerCase())
  if (!source || files.some((item) => item.name.toLowerCase() === targetName.toLowerCase())) return false
  files.push({ ...source, name: targetName, modified: new Date().toISOString() })
  saveFiles(files)
  return true
}

export function deleteFile(name: string, permanent = false) {
  const files = listFiles()
  const index = files.findIndex((item) => item.name.toLowerCase() === name.toLowerCase())
  if (index < 0) return false
  const [file] = files.splice(index, 1)
  saveFiles(files)
  if (!permanent && typeof window !== 'undefined') {
    const recycle = listRecycle()
    recycle.push({ ...file, deletedAt: new Date().toISOString() })
    window.localStorage.setItem('win95.recycle', JSON.stringify(recycle))
  }
  return true
}

export function listRecycle(): RecycleItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem('win95.recycle') ?? '[]') as RecycleItem[] } catch { return [] }
}

export function restoreRecycle(name: string) {
  const recycle = listRecycle()
  const index = recycle.findIndex((item) => item.name.toLowerCase() === name.toLowerCase())
  if (index < 0) return false
  const [file] = recycle.splice(index, 1)
  if (listFiles().some((item) => item.name.toLowerCase() === file.name.toLowerCase())) return false
  saveFiles([...listFiles(), file])
  window.localStorage.setItem('win95.recycle', JSON.stringify(recycle))
  return true
}

export function emptyRecycle() {
  if (typeof window !== 'undefined') window.localStorage.removeItem('win95.recycle')
}

export function readFile(name: string): string {
  return listFiles().find((file) => file.name.toLowerCase() === name.toLowerCase())?.content ?? ''
}

export function writeFile(name: string, content: string) {
  if (typeof window === 'undefined') return
  const files = listFiles()
  const existing = files.find((file) => file.name.toLowerCase() === name.toLowerCase())
  if (existing) { existing.content = content; existing.size = content.length; existing.modified = new Date().toISOString() }
  else files.push({ name, type: 'file', content, size: content.length, modified: new Date().toISOString() })
  saveFiles(files)
}
