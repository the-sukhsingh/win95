import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DesktopIcon } from '../components/DesktopIcon'
import { WindowFrame } from '../components/WindowFrame'
import { Minesweeper } from '../components/apps/Minesweeper'
import { APP_META, DEFAULT_WINDOWS, loadWindows, saveWindows, type AppId, type WindowState } from '../lib/os'

export const Route = createFileRoute('/')({ component: Win95Desktop })

function Win95Desktop() {
  const [booting, setBooting] = useState(true)
  const [windows, setWindows] = useState<WindowState[]>(() => loadWindows())
  const [activeId, setActiveId] = useState<AppId>('about')
  const [startOpen, setStartOpen] = useState(false)
  const [crt, setCrt] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [context, setContext] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1200)
    const tick = window.setInterval(() => setClock(new Date()), 1000)
    return () => { window.clearTimeout(timer); window.clearInterval(tick) }
  }, [])
  useEffect(() => saveWindows(windows), [windows])

  const openApp = (id: AppId) => {
    setStartOpen(false)
    setContext(null)
    setActiveId(id)
    setWindows((current) => {
      const existing = current.find((item) => item.id === id)
      if (existing) return current.map((item) => item.id === id ? { ...item, minimized: false, z: Date.now() } : item)
      const offset = current.length * 22
      return [...current, { id, minimized: false, maximized: false, x: 230 + offset, y: 74 + offset, width: 500, height: 310, z: Date.now() }]
    })
  }

  const updateWindow = (id: AppId, patch: Partial<WindowState>) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  const focus = (id: AppId) => {
    setActiveId(id)
    setWindows((current) => current.map((item) => item.id === id ? { ...item, z: Date.now(), minimized: false } : item))
  }

  if (booting) return <BootScreen onEnter={() => setBooting(false)} />

  return (
    <main className={`desktop ${crt ? 'crt' : ''}`} onClick={() => context && setContext(null)} onContextMenu={(event) => {
      if ((event.target as HTMLElement).closest('.window, .taskbar, .start-menu')) return
      event.preventDefault()
      setStartOpen(false)
      setContext({ x: event.clientX, y: event.clientY })
    }}>
      <div className="desktop-brand">Windows 95<span>WEB EDITION</span></div>
      <div className="desktop-icons">
        <DesktopIcon icon="🖥️" label="My Computer" onOpen={() => openApp('computer')} />
        <DesktopIcon icon="🗑️" label="Recycle Bin" onOpen={() => openApp('about')} />
        <DesktopIcon icon="🌐" label="Internet Explorer" onOpen={() => openApp('about')} />
        <DesktopIcon icon="📝" label="Notepad" onOpen={() => openApp('notepad')} />
        <DesktopIcon icon="💣" label="Minesweeper" onOpen={() => openApp('minesweeper')} />
      </div>

      {windows.map((item) => item.minimized ? null : (
        <WindowFrame key={item.id} state={item} active={item.id === activeId} onFocus={() => focus(item.id)}
          onClose={() => setWindows((current) => current.filter((entry) => entry.id !== item.id))}
          onMinimize={() => updateWindow(item.id, { minimized: true })}
          onMaximize={() => updateWindow(item.id, { maximized: !item.maximized })}
          onMove={(x, y) => updateWindow(item.id, { x, y })}>
          <WindowContent id={item.id} onOpen={openApp} />
        </WindowFrame>
      ))}

      {context && <div className="context-menu" style={{ left: context.x, top: context.y }} onClick={(event) => event.stopPropagation()}>
        <button onClick={() => { setContext(null); setCrt((value) => !value) }}>Display properties</button>
        <button onClick={() => openApp('notepad')}>New text document</button>
        <button onClick={() => setContext(null)}>Arrange icons</button>
        <hr />
        <button onClick={() => setContext(null)}>Refresh</button>
      </div>}

      {startOpen && <StartMenu onOpen={openApp} onClose={() => setStartOpen(false)} />}
      <footer className="taskbar">
        <button className={`start-button ${startOpen ? 'pressed' : ''}`} onClick={(event) => { event.stopPropagation(); setStartOpen((value) => !value) }}>
          <strong>⊞</strong> Start
        </button>
        <div className="task-tabs">
          {windows.map((item) => <button key={item.id} className={item.id === activeId && !item.minimized ? 'task-tab active' : 'task-tab'} onClick={() => item.minimized ? focus(item.id) : (setActiveId(item.id), updateWindow(item.id, { minimized: true }))}><span>{APP_META[item.id].icon}</span>{APP_META[item.id].title}</button>)}
        </div>
        <div className="tray"><button onClick={() => setCrt((value) => !value)} title="Toggle CRT effect">{crt ? '◉' : '◎'}</button><span>🔊</span><time>{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>
      </footer>
    </main>
  )
}

function BootScreen({ onEnter }: { onEnter: () => void }) {
  return <section className="boot-screen" onClick={onEnter}><div className="boot-card"><div className="boot-logo"><span>▤</span><strong>Microsoft</strong></div><div className="boot-line" /><p>Starting Windows 95 Web Edition...</p><div className="progress"><i /></div><button onClick={onEnter}>Enter desktop</button><small>Click anywhere to skip</small></div></section>
}

function StartMenu({ onOpen, onClose }: { onOpen: (id: AppId) => void; onClose: () => void }) {
  return <div className="start-menu" onClick={(event) => event.stopPropagation()}><div className="start-rail">Windows<span>95</span></div><div className="start-items">
    <button className="start-item featured" onClick={() => onOpen('about')}><span>▤</span><b>Welcome</b><em>Read me</em></button>
    <button className="start-item" onClick={() => onOpen('computer')}><span>🖥️</span><b>My Computer</b></button>
    <button className="start-item" onClick={() => onOpen('notepad')}><span>📝</span><b>Accessories</b><em>Notepad</em></button>
    <button className="start-item" onClick={() => onOpen('minesweeper')}><span>💣</span><b>Games</b><em>Minesweeper</em></button>
    <button className="start-item" onClick={() => onOpen('terminal')}><span>▣</span><b>MS-DOS Prompt</b></button>
    <hr /><button className="start-item" onClick={onClose}><span>⏻</span><b>Shut Down...</b></button>
  </div></div>
}

function WindowContent({ id, onOpen }: { id: AppId; onOpen: (id: AppId) => void }) {
  if (id === 'notepad') return <Notepad />
  if (id === 'terminal') return <Terminal />
  if (id === 'minesweeper') return <Minesweeper />
  if (id === 'computer') return <FileExplorer onOpen={onOpen} />
  return <Welcome onOpen={onOpen} />
}

function Welcome({ onOpen }: { onOpen: (id: AppId) => void }) {
  return <div className="welcome"><div className="welcome-hero"><span className="big-logo">▤</span><div><h1>Welcome to Windows 95</h1><p>A tiny time machine, lovingly rebuilt for the modern web.</p></div></div><div className="welcome-grid"><button onClick={() => onOpen('computer')}><span>🖥️</span><b>Explore files</b><small>Browse the fictional C:\\ drive</small></button><button onClick={() => onOpen('minesweeper')}><span>💣</span><b>Play Minesweeper</b><small>Classic desktop distraction</small></button><button onClick={() => onOpen('terminal')}><span>▣</span><b>Open DOS</b><small>Try <code>help</code> or <code>matrix</code></small></button></div><div className="status-note"><span className="led" /> System ready <span>•</span> 16-bit compatible <span>•</span> Built for nostalgia</div></div>
}

function FileExplorer({ onOpen }: { onOpen: (id: AppId) => void }) {
  return <div className="explorer"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help</div><div className="address">📁 <b>Address:</b> C:\WINDOWS\Desktop</div><div className="file-grid"><button onDoubleClick={() => onOpen('notepad')}><span>📝</span><b>README.TXT</b><small>Text Document</small></button><button onDoubleClick={() => onOpen('about')}><span>🌐</span><b>WEB95.URL</b><small>Internet Shortcut</small></button><button onDoubleClick={() => onOpen('minesweeper')}><span>💣</span><b>MINESW~1.EXE</b><small>Application</small></button><button><span>📂</span><b>MY DOCS</b><small>File Folder</small></button></div><div className="statusbar">4 object(s) &nbsp; &nbsp; 12.4 MB available</div></div>
}

function Notepad() {
  const [text, setText] = useState('Welcome to Windows 95 Web Edition!\\n\\nThis is a fully functional notepad.\\nType something brilliant here...\\n')
  const download = () => { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'README.TXT'; anchor.click(); URL.revokeObjectURL(url) }
  return <div className="notepad"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; Search&nbsp;&nbsp; Help</div><textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} /><div className="notepad-actions"><button onClick={download}>Save as .TXT</button><span>{text.length} characters</span></div></div>
}

function Terminal() {
  const [lines, setLines] = useState(['Microsoft(R) Windows 95', '(C)Copyright Microsoft Corp 1981-1995.', '', 'C:\\WINDOWS> Type "help" for a list of commands.'])
  const [value, setValue] = useState('')
  const commands = useMemo(() => ({ help: 'DIR  CD  CLS  VER  MATRIX  ABOUT', ver: 'Windows 95 Web Edition [Version 4.00.950]', dir: 'README.TXT  WEB95.URL  MINESW~1.EXE  MY DOCS', about: 'A lovingly crafted browser-based desktop.', matrix: 'Wake up, Neo... the Matrix has you.', cd: 'C:\\WINDOWS', cls: '' }), [])
  const run = () => { const input = value.trim().toLowerCase(); if (!input) return; setLines((current) => [...current, `C:\\WINDOWS>${value}`, commands[input as keyof typeof commands] ?? `'${input}' is not recognized as an internal command.`]); setValue('') }
  return <div className="terminal"><div className="terminal-output">{lines.map((line, index) => <div key={`${line}-${index}`}>{line || '\u00a0'}</div>)}</div><div className="terminal-input"><span>C:\WINDOWS&gt;</span><input autoFocus value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && run()} /></div></div>
}
