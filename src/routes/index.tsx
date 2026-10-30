import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DesktopIcon } from '../components/DesktopIcon'
import { WindowFrame } from '../components/WindowFrame'
import { Minesweeper } from '../components/apps/Minesweeper'
import { Notepad } from '../components/apps/Notepad'
import { Terminal } from '../components/apps/Terminal'
import { Paint } from '../components/apps/Paint'
import { InternetExplorer } from '../components/apps/InternetExplorer'
import { Solitaire } from '../components/apps/Solitaire'
import { createFile, deleteFile, emptyRecycle, listFiles, listRecycle, renameFile, restoreRecycle, type VfsFile } from '../lib/vfs'
import { APP_META, loadWindows, saveWindows, type AppId, type WindowState } from '../lib/os'

export const Route = createFileRoute('/')({ component: Win95Desktop })

function Win95Desktop() {
  const [powerState, setPowerState] = useState<'boot' | 'desktop' | 'shutdown'>('boot')
  const [windows, setWindows] = useState<WindowState[]>(() => loadWindows())
  const [activeId, setActiveId] = useState<AppId>('about')
  const [startOpen, setStartOpen] = useState(false)
  const [crt, setCrt] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [context, setContext] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setPowerState('desktop'), 1500)
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

  if (powerState === 'boot') return <BootScreen onEnter={() => setPowerState('desktop')} />
  if (powerState === 'shutdown') return <ShutdownScreen onPowerOn={() => setPowerState('boot')} />

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
        <DesktopIcon icon="🗑️" label="Recycle Bin" onOpen={() => openApp('recycle')} />
        <DesktopIcon icon="🌐" label="Internet Explorer" onOpen={() => openApp('internet-explorer')} />
        <DesktopIcon icon="📝" label="Notepad" onOpen={() => openApp('notepad')} />
        <DesktopIcon icon="💣" label="Minesweeper" onOpen={() => openApp('minesweeper')} />
        <DesktopIcon icon="🎨" label="Paint" onOpen={() => openApp('paint')} />
        <DesktopIcon icon="🧮" label="Calculator" onOpen={() => openApp('calculator')} />
        <DesktopIcon icon="🃏" label="Solitaire" onOpen={() => openApp('solitaire')} />
      </div>

      {windows.map((item) => item.minimized ? null : (
        <WindowFrame key={item.id} state={item} active={item.id === activeId} onFocus={() => focus(item.id)}
          onClose={() => setWindows((current) => current.filter((entry) => entry.id !== item.id))}
          onMinimize={() => updateWindow(item.id, { minimized: true })}
          onMaximize={() => updateWindow(item.id, { maximized: !item.maximized })}
          onMove={(x, y) => updateWindow(item.id, { x, y })}
          onResize={(width, height) => updateWindow(item.id, { width, height })}>
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

      {startOpen && <StartMenu onOpen={openApp} onShutdown={() => { setStartOpen(false); setPowerState('shutdown') }} />}
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
  return <section className="boot-screen"><div className="boot-card"><div className="boot-logo"><span>▤</span><strong>Microsoft</strong></div><div className="boot-line" /><p>Starting Windows 95 Web Edition...</p><div className="progress"><i /></div><button onClick={onEnter}>Enter desktop</button><small>Click anywhere to skip</small></div></section>
}

function ShutdownScreen({ onPowerOn }: { onPowerOn: () => void }) {
  return <section className="shutdown-screen"><div className="shutdown-card"><span className="shutdown-logo">▤</span><h1>Windows 95</h1><p>It is now safe to turn off your computer.</p><button onClick={onPowerOn}>Power on again</button></div></section>
}

function StartMenu({ onOpen, onShutdown }: { onOpen: (id: AppId) => void; onShutdown: () => void }) {
  return <div className="start-menu" onClick={(event) => event.stopPropagation()}><div className="start-rail">Windows<span>95</span></div><div className="start-items">
    <button className="start-item featured" onClick={() => onOpen('about')}><span>▤</span><b>Welcome</b><em>Read me</em></button>
    <button className="start-item" onClick={() => onOpen('computer')}><span>🖥️</span><b>My Computer</b></button>
    <button className="start-item" onClick={() => onOpen('control-panel')}><span>⚙️</span><b>Settings</b><em>Control Panel</em></button>
    <button className="start-item" onClick={() => onOpen('internet-explorer')}><span>🌐</span><b>Internet Explorer</b><em>Browse the web</em></button>
    <button className="start-item" onClick={() => onOpen('notepad')}><span>📝</span><b>Accessories</b><em>Notepad</em></button>
    <button className="start-item" onClick={() => onOpen('minesweeper')}><span>💣</span><b>Games</b><em>Minesweeper</em></button>
    <button className="start-item" onClick={() => onOpen('paint')}><span>🎨</span><b>Accessories</b><em>Paint</em></button>
    <button className="start-item" onClick={() => onOpen('terminal')}><span>▣</span><b>MS-DOS Prompt</b></button>
    <button className="start-item" onClick={() => onOpen('calculator')}><span>🧮</span><b>Accessories</b><em>Calculator</em></button>
    <button className="start-item" onClick={() => onOpen('wordpad')}><span>📄</span><b>Accessories</b><em>WordPad</em></button>
    <button className="start-item" onClick={() => onOpen('help')}><span>❓</span><b>Help</b></button>
    <button className="start-item" onClick={() => onOpen('solitaire')}><span>🃏</span><b>Games</b><em>Solitaire</em></button>
    <button className="start-item" onClick={() => onOpen('freecell')}><span>🃏</span><b>Games</b><em>FreeCell</em></button>
    <button className="start-item" onClick={() => onOpen('run')}><span>▶️</span><b>Run...</b></button>
    <hr />    <button className="start-item" onClick={onShutdown}><span>⏻</span><b>Shut Down...</b></button>
  </div></div>
}

function WindowContent({ id, onOpen }: { id: AppId; onOpen: (id: AppId) => void }) {
  if (id === 'notepad') return <Notepad />
  if (id === 'terminal') return <Terminal />
  if (id === 'minesweeper') return <Minesweeper />
  if (id === 'computer') return <FileExplorer onOpen={onOpen} />
  if (id === 'paint') return <Paint />
  if (id === 'internet-explorer') return <InternetExplorer />
  if (id === 'recycle') return <RecycleBin />
  if (id === 'control-panel') return <ControlPanel onOpen={onOpen} />
  if (id === 'calculator') return <Calculator />
  if (id === 'wordpad') return <WordPad />
  if (id === 'help') return <Help />
  if (id === 'run') return <RunDialog onOpen={onOpen} />
  if (id === 'solitaire') return <Solitaire />
  if (id === 'freecell') return <Solitaire freeCell />
  return <Welcome onOpen={onOpen} />
}

function Welcome({ onOpen }: { onOpen: (id: AppId) => void }) {
  return <div className="welcome"><div className="welcome-hero"><span className="big-logo">▤</span><div><h1>Welcome to Windows 95</h1><p>A tiny time machine, lovingly rebuilt for the modern web.</p></div></div><div className="welcome-grid"><button onClick={() => onOpen('computer')}><span>🖥️</span><b>Explore files</b><small>Browse the fictional C:\\ drive</small></button><button onClick={() => onOpen('minesweeper')}><span>💣</span><b>Play Minesweeper</b><small>Classic desktop distraction</small></button><button onClick={() => onOpen('terminal')}><span>▣</span><b>Open DOS</b><small>Try <code>help</code> or <code>matrix</code></small></button></div><div className="status-note"><span className="led" /> System ready <span>•</span> 16-bit compatible <span>•</span> Built for nostalgia</div></div>
}

function FileExplorer({ onOpen }: { onOpen: (id: AppId) => void }) {
  const [files, setFiles] = useState(listFiles())
  const [selected, setSelected] = useState<string | null>(null)
  const refresh = () => setFiles(listFiles())
  const open = (file: VfsFile) => {
    if (file.name === 'README.TXT') onOpen('notepad')
    else if (file.name === 'MINESW~1.EXE') onOpen('minesweeper')
    else if (file.name === 'WEB95.URL') onOpen('internet-explorer')
  }
  const newFile = () => { const name = window.prompt('New file name:', 'UNTITLED.TXT'); if (name && createFile(name)) refresh() }
  const rename = () => { if (!selected) return; const name = window.prompt('Rename item:', selected); if (name && renameFile(selected, name)) refresh() }
  const remove = () => { if (selected && window.confirm(`Move ${selected} to the Recycle Bin?`)) { deleteFile(selected); setSelected(null); refresh() } }
  return <div className="explorer"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help <span className="explorer-actions"><button onClick={newFile}>New</button><button onClick={rename} disabled={!selected}>Rename</button><button onClick={remove} disabled={!selected}>Delete</button></span></div><div className="address">📁 <b>Address:</b> C:\WINDOWS\Desktop</div><div className="file-grid">{files.map((file) => <button key={file.name} className={selected === file.name ? 'selected' : ''} onClick={() => setSelected(file.name)} onDoubleClick={() => open(file)}><span>{file.type === 'folder' ? '📂' : file.name.endsWith('.EXE') ? '💣' : file.name.endsWith('.URL') ? '🌐' : '📝'}</span><b>{file.name}</b><small>{file.type === 'folder' ? 'File Folder' : `${file.size ?? file.content?.length ?? 0} bytes`}</small></button>)}</div><div className="statusbar">{files.length} object(s) &nbsp; &nbsp; 12.4 MB available</div></div>
}

function RecycleBin() {
  const [items, setItems] = useState(listRecycle())
  const refresh = () => setItems(listRecycle())
  return <div className="recycle"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help <button onClick={() => { emptyRecycle(); refresh() }}>Empty Recycle Bin</button></div><div className="file-grid">{items.map((item) => <button key={`${item.name}-${item.deletedAt}`} onDoubleClick={() => { restoreRecycle(item.name); refresh() }}><span>🗑️</span><b>{item.name}</b><small>Double-click to restore</small></button>)}</div><div className="statusbar">{items.length} object(s)</div></div>
}

function ControlPanel({ onOpen }: { onOpen: (id: AppId) => void }) {
  const tools: Array<[string, string, AppId?]> = [['🖥️', 'Display', undefined], ['🕘', 'Date/Time', undefined], ['🖨️', 'Printers', 'printer'], ['⌨️', 'Keyboard', undefined], ['🖱️', 'Mouse', undefined], ['🔊', 'Sounds', 'media-player'], ['🌐', 'Network', undefined], ['📦', 'Add/Remove Programs', undefined], ['❓', 'Accessibility Options', 'help']]
  return <div className="control-panel"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help</div><div className="control-grid">{tools.map(([icon, label, app]) => <button key={label} onClick={() => app ? onOpen(app) : window.alert(`${label} settings are managed by Windows 95 Web Edition.`)}><span>{icon}</span><b>{label}</b></button>)}</div></div>
}

function Calculator() {
  const [value, setValue] = useState('0')
  const [memory, setMemory] = useState(0)
  const [operator, setOperator] = useState<string | null>(null)
  const [stored, setStored] = useState(0)
  const press = (key: string) => {
    if (/^\d$/.test(key) || key === '.') setValue(value === '0' ? key : value + key)
    else if (key === 'C') { setValue('0'); setOperator(null); setStored(0) }
    else if (key === 'MC') setMemory(0)
    else if (key === 'M+') setMemory(memory + Number(value))
    else if (key === 'MR') setValue(String(memory))
    else if (key === '√') setValue(String(Math.sqrt(Number(value))))
    else if (key === '±') setValue(String(Number(value) * -1))
    else if (key === '=') { if (operator) setValue(String(operator === '+' ? stored + Number(value) : operator === '-' ? stored - Number(value) : operator === '×' ? stored * Number(value) : stored / Number(value))); setOperator(null) }
    else { setStored(Number(value)); setOperator(key); setValue('0') }
  }
  return <div className="calculator"><input readOnly value={value} /><div className="calc-mode"><button>Standard</button><button>Scientific</button></div><div className="calc-grid">{['MC','MR','M+','C','√','±','7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'].map((key) => <button key={key} onClick={() => press(key)}>{key}</button>)}</div></div>
}

function WordPad() {
  const [text, setText] = useState('Welcome to WordPad.\n\nType your document here.')
  const [font, setFont] = useState('Arial')
  const [size, setSize] = useState('14px')
  const [weight, setWeight] = useState<'normal' | 'bold'>('normal')
  const [style, setStyle] = useState<'normal' | 'italic'>('normal')
  const download = () => { const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(new Blob([text], { type: 'text/rtf' })); anchor.download = 'DOCUMENT.RTF'; anchor.click() }
  return <div className="wordpad"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Insert&nbsp;&nbsp; Format&nbsp;&nbsp; Help</div><div className="formatbar"><select value={font} onChange={(event) => setFont(event.target.value)}><option>Arial</option><option>Times New Roman</option><option>Courier New</option></select><select value={size} onChange={(event) => setSize(event.target.value)}><option>10px</option><option>14px</option><option>16px</option><option>24px</option></select><button onClick={() => setWeight(weight === 'bold' ? 'normal' : 'bold')}><b>B</b></button><button onClick={() => setStyle(style === 'italic' ? 'normal' : 'italic')}><i>I</i></button><button><u>U</u></button><button>≡</button><button>≣</button><button onClick={download}>Save</button></div><textarea value={text} onChange={(event) => setText(event.target.value)} style={{ fontFamily: font, fontSize: size, fontWeight: weight, fontStyle: style }} /><div className="statusbar">Document &nbsp; {text.length} characters</div></div>
}

function Help() {
  return <div className="help-app"><div className="menu-strip">Help&nbsp;&nbsp; Bookmark&nbsp;&nbsp; Options</div><div className="help-layout"><aside><b>Contents</b><button>Windows 95 basics</button><button>Managing files</button><button>Using accessories</button><button>Troubleshooting</button></aside><article><h2>Windows Help</h2><p>Welcome to Windows 95 Web Edition Help.</p><h3>Getting started</h3><p>Double-click desktop icons to launch applications. Use Start to access programs, settings, Find, Help, Run, and Shut Down.</p><h3>Managing files</h3><p>Open My Computer to create, rename, delete, and open files. Deleted items can be restored from the Recycle Bin.</p></article></div></div>
}

function RunDialog({ onOpen }: { onOpen: (id: AppId) => void }) {
  const [command, setCommand] = useState('')
  const run = () => { const value = command.toLowerCase(); const match: Array<[string, AppId]> = [['notepad', 'notepad'], ['calc', 'calculator'], ['mspaint', 'paint'], ['winmine', 'minesweeper'], ['explorer', 'computer'], ['wordpad', 'wordpad'], ['help', 'help']]; const found = match.find(([name]) => value.includes(name)); if (found) onOpen(found[1]); else window.alert('Windows cannot find this command.') }
  return <div className="run-dialog"><span className="run-icon">▶️</span><div><h3>Run</h3><p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p><input autoFocus value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && run()} /><div><button onClick={run}>OK</button><button>Cancel</button><button>Browse...</button></div></div></div>
}
