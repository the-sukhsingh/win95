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
import { copyFile, createFile, createFile as createFolder, deleteFile, emptyRecycle, listFiles, listRecycle, moveFile, renameFile, restoreRecycle, type VfsFile } from '../lib/vfs'
import { APP_META, loadWindows, saveWindows, type AppId, type WindowState } from '../lib/os'

export const Route = createFileRoute('/')({ component: Win95Desktop })

function Win95Desktop() {
  const [powerState, setPowerState] = useState<'boot' | 'desktop' | 'shutdown'>('boot')
  const [windows, setWindows] = useState<WindowState[]>(() => loadWindows())
  const [activeId, setActiveId] = useState<AppId>('about')
  const [startOpen, setStartOpen] = useState(false)
  const [crt, setCrt] = useState(false)
  const [taskbarHidden, setTaskbarHidden] = useState(false)
  const [taskbarTop, setTaskbarTop] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [context, setContext] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setPowerState('desktop'), 1500)
    const tick = window.setInterval(() => setClock(new Date()), 1000)
    return () => { window.clearTimeout(timer); window.clearInterval(tick) }
  }, [])
  useEffect(() => saveWindows(windows), [windows])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'Tab') {
        event.preventDefault()
        const index = windows.findIndex((item) => item.id === activeId)
        const next = windows[(index + 1) % Math.max(1, windows.length)]
        if (next) focus(next.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [windows, activeId])

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

  const arrange = (mode: 'cascade' | 'tile') => {
    setWindows((current) => current.map((item, index) => mode === 'cascade'
      ? { ...item, minimized: false, maximized: false, x: 180 + index * 26, y: 58 + index * 26, z: Date.now() + index }
      : { ...item, minimized: false, maximized: false, x: 8 + (index % 2) * 50, y: 8 + Math.floor(index / 2) * 36, width: Math.max(320, window.innerWidth / 2 - 20), height: Math.max(220, (window.innerHeight - 70) / 2), z: Date.now() + index }))
  }
  return (
    <main className={`desktop ${crt ? 'crt' : ''} ${taskbarHidden ? 'taskbar-auto-hide' : ''}`} onClick={() => context && setContext(null)} onContextMenu={(event) => {
      if ((event.target as HTMLElement).closest('.window, .taskbar, .start-menu')) return
      event.preventDefault()
      setStartOpen(false)
      setContext({ x: event.clientX, y: event.clientY })
    }}>
      <div className="desktop-brand">Windows 95<span>WEB EDITION</span></div>
      <div className="desktop-icons">
        <DesktopIcon icon="🖥️" label="My Computer" onOpen={() => openApp('computer')} />
        <DesktopIcon icon="🌐" label="Network Neighborhood" onOpen={() => openApp('network')} />
        <DesktopIcon icon="📨" label="Inbox" onOpen={() => openApp('inbox')} />
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
        <button onClick={() => { arrange('cascade'); setContext(null) }}>Cascade windows</button>
        <button onClick={() => { arrange('tile'); setContext(null) }}>Tile windows</button>
        <button onClick={() => { setTaskbarHidden((value) => !value); setContext(null) }}>Auto-hide taskbar</button>
        <button onClick={() => { setTaskbarTop((value) => !value); setContext(null) }}>Move taskbar to {taskbarTop ? 'bottom' : 'top'}</button>
        <hr />
        <button onClick={() => setContext(null)}>Refresh</button>
      </div>}

      {startOpen && <StartMenu onOpen={openApp} onShutdown={() => { setStartOpen(false); setPowerState('shutdown') }} />}
      <footer className={`taskbar ${taskbarTop ? 'top' : ''}`}>
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
  const [expanded, setExpanded] = useState<'programs' | 'documents' | 'settings' | null>(null)
  const item = (icon: string, label: string, id: AppId, detail?: string) => <button className="start-item" onClick={() => onOpen(id)}><span>{icon}</span><b>{label}</b>{detail && <em>{detail}</em>}</button>
  return <div className="start-menu" onClick={(event) => event.stopPropagation()}><div className="start-rail">Windows<span>95</span></div><div className="start-items">
    {item('▤', 'Welcome', 'about', 'Read me')}
    <button className={`start-item start-folder ${expanded === 'programs' ? 'open' : ''}`} onClick={() => setExpanded(expanded === 'programs' ? null : 'programs')}><span>📁</span><b>Programs</b><i>▶</i></button>
    {expanded === 'programs' && <div className="start-submenu">{item('🌐', 'Internet Explorer', 'internet-explorer', 'Browse the web')}{item('📝', 'Accessories', 'notepad', 'Notepad')}{item('🎨', 'Paint', 'paint')}{item('🧮', 'Calculator', 'calculator')}{item('📄', 'WordPad', 'wordpad')}{item('🎙️', 'Sound Recorder', 'sound-recorder')}{item('Ω', 'Character Map', 'character-map')}{item('🛠️', 'System Tools', 'system-tools')}</div>}
    <button className={`start-item start-folder ${expanded === 'documents' ? 'open' : ''}`} onClick={() => setExpanded(expanded === 'documents' ? null : 'documents')}><span>📂</span><b>Documents</b><i>▶</i></button>
    {expanded === 'documents' && <div className="start-submenu">{item('🖥️', 'My Computer', 'computer')}{item('🗑️', 'Recycle Bin', 'recycle')}{item('🔎', 'Find Files', 'find', 'Files or Folders')}</div>}
    <button className={`start-item start-folder ${expanded === 'settings' ? 'open' : ''}`} onClick={() => setExpanded(expanded === 'settings' ? null : 'settings')}><span>⚙️</span><b>Settings</b><i>▶</i></button>
    {expanded === 'settings' && <div className="start-submenu">{item('⚙️', 'Control Panel', 'control-panel')}{item('🖨️', 'Printers', 'printer')}{item('🔊', 'Volume Control', 'volume-control')}{item('💿', 'CD Player', 'cd-player')}</div>}
    {item('💣', 'Minesweeper', 'minesweeper')}{item('🃏', 'Solitaire', 'solitaire')}{item('🃏', 'FreeCell', 'freecell')}{item('▣', 'MS-DOS Prompt', 'terminal')}{item('❓', 'Help', 'help')}{item('▶️', 'Run...', 'run')}
    <hr /><button className="start-item" onClick={onShutdown}><span>⏻</span><b>Shut Down...</b></button>
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
  if (id === 'media-player') return <MediaPlayer />
  if (id === 'printer') return <Printer />
  if (id === 'find') return <FindFiles />
  if (id === 'system-tools') return <SystemTools />
  if (id === 'character-map') return <CharacterMap />
  if (id === 'clipboard') return <ClipboardViewer />
  if (id === 'sound-recorder') return <SoundRecorder />
  if (id === 'phone-dialer') return <PhoneDialer />
  if (id === 'cd-player') return <MediaPlayer compact />
  if (id === 'volume-control') return <VolumeControl />
  if (id === 'settings') return <ControlPanel onOpen={onOpen} />
  if (id === 'network') return <InfoApp title="Network Neighborhood" icon="🌐" text="No network computers are currently connected. Use Control Panel > Network to configure a network." />
  if (id === 'inbox') return <InfoApp title="Inbox" icon="📨" text="Microsoft Exchange Web Edition is ready. No new messages." />
  return <Welcome onOpen={onOpen} />
}

function Welcome({ onOpen }: { onOpen: (id: AppId) => void }) {
  return <div className="welcome"><div className="welcome-hero"><span className="big-logo">▤</span><div><h1>Welcome to Windows 95</h1><p>A tiny time machine, lovingly rebuilt for the modern web.</p></div></div><div className="welcome-grid"><button onClick={() => onOpen('computer')}><span>🖥️</span><b>Explore files</b><small>Browse the fictional C:\\ drive</small></button><button onClick={() => onOpen('minesweeper')}><span>💣</span><b>Play Minesweeper</b><small>Classic desktop distraction</small></button><button onClick={() => onOpen('terminal')}><span>▣</span><b>Open DOS</b><small>Try <code>help</code> or <code>matrix</code></small></button></div><div className="status-note"><span className="led" /> System ready <span>•</span> 16-bit compatible <span>•</span> Built for nostalgia</div></div>
}

function FileExplorer({ onOpen }: { onOpen: (id: AppId) => void }) {
  const [files, setFiles] = useState(listFiles())
  const [selected, setSelected] = useState<string | null>(null)
  const [clipboard, setClipboard] = useState<string | null>(null)
  const [cut, setCut] = useState(false)
  const [view, setView] = useState<'icons' | 'list' | 'details'>('icons')
  const [sort, setSort] = useState<'name' | 'type' | 'size'>('name')
  const refresh = () => setFiles(listFiles())
  const open = (file: VfsFile) => {
    if (file.name === 'README.TXT') onOpen('notepad')
    else if (file.name === 'MINESW~1.EXE') onOpen('minesweeper')
    else if (file.name === 'WEB95.URL') onOpen('internet-explorer')
  }
  const newFile = () => { const name = window.prompt('New file name:', 'UNTITLED.TXT'); if (name && createFile(name)) refresh() }
  const newFolder = () => { const name = window.prompt('New folder name:', 'NEW FOLDER'); if (name && createFolder(name, 'folder')) refresh() }
  const rename = () => { if (!selected) return; const name = window.prompt('Rename item:', selected); if (name && renameFile(selected, name)) refresh() }
  const remove = () => { if (selected && window.confirm(`Move ${selected} to the Recycle Bin?`)) { deleteFile(selected); setSelected(null); refresh() } }
  const paste = () => { if (!clipboard) return; const worked = cut ? moveFile(clipboard, `${clipboard} - Moved`) : copyFile(clipboard, `${clipboard} - Copy`); if (worked) { setClipboard(null); setCut(false); refresh() } }
  const sorted = [...files].sort((a, b) => sort === 'type' ? a.type.localeCompare(b.type) : sort === 'size' ? (a.size ?? 0) - (b.size ?? 0) : a.name.localeCompare(b.name))
  return <div className="explorer"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help <span className="explorer-actions"><button onClick={newFile}>New File</button><button onClick={newFolder}>New Folder</button><button onClick={() => { if (selected) { setClipboard(selected); setCut(false) } }} disabled={!selected}>Copy</button><button onClick={() => { if (selected) { setClipboard(selected); setCut(true) } }} disabled={!selected}>Cut</button><button onClick={paste} disabled={!clipboard}>Paste</button><button onClick={rename} disabled={!selected}>Rename</button><button onClick={remove} disabled={!selected}>Delete</button></span></div><div className="address"><select defaultValue="C:"><option>C:</option><option>A: Floppy Disk</option><option>D: CD Drive</option><option>Network Neighborhood</option></select> <b>C:\WINDOWS\Desktop</b><span className="view-buttons"><button onClick={() => setView('icons')}>▦</button><button onClick={() => setView('list')}>☷</button><button onClick={() => setView('details')}>☰</button><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="name">Name</option><option value="type">Type</option><option value="size">Size</option></select></span></div><div className={`file-grid file-view-${view}`}>{sorted.map((file) => <button key={file.name} className={selected === file.name ? 'selected' : ''} onClick={() => setSelected(file.name)} onDoubleClick={() => open(file)} onContextMenu={(event) => { event.preventDefault(); window.alert(`${file.name}\nType: ${file.type === 'folder' ? 'File folder' : 'File'}\nSize: ${file.size ?? file.content?.length ?? 0} bytes`) }}><span>{file.type === 'folder' ? '📂' : file.name.endsWith('.EXE') ? '💣' : file.name.endsWith('.URL') ? '🌐' : file.name.endsWith('.LNK') ? '🔗' : '📝'}</span><b>{file.name}</b><small>{file.type === 'folder' ? 'File Folder' : `${file.size ?? file.content?.length ?? 0} bytes`}</small></button>)}</div><div className="statusbar">{files.length} object(s){clipboard ? ` • ${cut ? 'Cut' : 'Copied'}: ${clipboard}` : ''} &nbsp; &nbsp; 12.4 MB available</div></div>
}

function InfoApp({ title, icon, text }: { title: string; icon: string; text: string }) {
  return <div className="info-app"><div className="info-hero"><span>{icon}</span><div><h2>{title}</h2><p>{text}</p></div></div><div className="info-actions"><button onClick={() => window.alert(text)}>Properties</button><button onClick={() => window.alert('This feature is configured through Control Panel.')}>Configure</button></div></div>
}

function RecycleBin() {
  const [items, setItems] = useState(listRecycle())
  const refresh = () => setItems(listRecycle())
  return <div className="recycle"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help <button onClick={() => { emptyRecycle(); refresh() }}>Empty Recycle Bin</button></div><div className="file-grid">{items.map((item) => <button key={`${item.name}-${item.deletedAt}`} onDoubleClick={() => { restoreRecycle(item.name); refresh() }}><span>🗑️</span><b>{item.name}</b><small>Double-click to restore</small></button>)}</div><div className="statusbar">{items.length} object(s)</div></div>
}

function ControlPanel({ onOpen }: { onOpen: (id: AppId) => void }) {
  const [selected, setSelected] = useState('Display')
  const [theme, setTheme] = useState('Teal')
  const tools: Array<[string, string, AppId?]> = [['🖥️', 'Display'], ['🕘', 'Date/Time'], ['🔤', 'Fonts'], ['🖨️', 'Printers', 'printer'], ['⌨️', 'Keyboard'], ['🖱️', 'Mouse'], ['🔊', 'Sounds', 'media-player'], ['🌐', 'Network', 'network'], ['🔐', 'Passwords'], ['🗺️', 'Regional Settings'], ['📦', 'Add/Remove Programs'], ['⚙️', 'Add New Hardware'], ['📠', 'Modems'], ['✉️', 'Mail and Fax'], ['❓', 'Accessibility Options', 'help'], ['🧩', 'System']]
  const details: Record<string, string> = { Display: 'Change the desktop wallpaper, color scheme, and display resolution.', 'Date/Time': 'Set the system clock and time zone.', Fonts: 'Install and manage TrueType and bitmap fonts.', Printers: 'Add local or network printers and manage print jobs.', Keyboard: 'Configure repeat rate and keyboard layout.', Mouse: 'Configure button order, pointer speed, and cursor trails.', Sounds: 'Choose Windows event sounds and mixer settings.', Network: 'Configure network neighborhood and mapped drives.', Passwords: 'Manage user profiles and saved network passwords.', 'Regional Settings': 'Choose language, number, currency, and date formats.', 'Add/Remove Programs': 'Install or remove Windows programs and components.', 'Add New Hardware': 'Detect and configure hardware devices.', Modems: 'Configure dial-up modem devices.', 'Mail and Fax': 'Configure Microsoft Exchange and fax profiles.', 'Accessibility Options': 'Configure keyboard, mouse, display, and sound accessibility.', System: 'View memory, operating system, and device information.' }
  const activate = (label: string, app?: AppId) => { setSelected(label); if (app) onOpen(app) }
  return <div className="control-panel"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help</div><div className="control-layout"><div className="control-grid">{tools.map(([icon, label, app]) => <button key={label} className={selected === label ? 'selected' : ''} onDoubleClick={() => activate(label, app)} onClick={() => activate(label)}><span>{icon}</span><b>{label}</b></button>)}</div><aside className="control-details"><h3>{selected}</h3><p>{details[selected]}</p>{selected === 'Display' && <label>Color scheme <select value={theme} onChange={(event) => setTheme(event.target.value)}><option>Teal</option><option>High Contrast</option><option>Cloudy</option></select></label>}{selected === 'Date/Time' && <input type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />}{selected === 'System' && <p>Windows 95 Web Edition<br />32 MB virtual memory<br />Web hardware abstraction layer</p>}<button onClick={() => window.alert(`${selected} settings saved.`)}>Apply</button></aside></div></div>
}

function Calculator() {
  const [value, setValue] = useState('0')
  const [memory, setMemory] = useState(0)
  const [operator, setOperator] = useState<string | null>(null)
  const [stored, setStored] = useState<number | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [error, setError] = useState(false)
  const calculate = (left: number, right: number, operation: string) => {
    if (operation === '+') return left + right
    if (operation === '-') return left - right
    if (operation === '×') return left * right
    if (operation === '÷') return right === 0 ? null : left / right
    return right
  }
  const press = (key: string) => {
    if (/^\d$/.test(key)) {
      setError(false)
      setValue(waitingForOperand || value === '0' ? key : value + key)
      setWaitingForOperand(false)
    } else if (key === '.') {
      setError(false)
      if (waitingForOperand) { setValue('0.'); setWaitingForOperand(false) }
      else if (!value.includes('.')) setValue(`${value}.`)
    } else if (key === 'C') { setValue('0'); setOperator(null); setStored(null); setWaitingForOperand(false); setError(false) }
    else if (key === 'MC') setMemory(0)
    else if (key === 'M+') setMemory(memory + (Number(value) || 0))
    else if (key === 'MR') { setValue(String(memory)); setWaitingForOperand(false); setError(false) }
    else if (key === '√') {
      const result = Math.sqrt(Number(value))
      if (!Number.isFinite(result)) { setValue('Error'); setError(true) } else setValue(String(result))
      setWaitingForOperand(true)
    } else if (key === '±' && !error) setValue(String(Number(value) * -1))
    else if (key === '=') {
      if (!operator || stored === null || error) return
      const result = calculate(stored, Number(value), operator)
      if (result === null || !Number.isFinite(result)) { setValue('Cannot divide by zero'); setError(true) }
      else { setValue(String(result)); setStored(result) }
      setOperator(null)
      setWaitingForOperand(true)
    } else if (error) {
      setValue('0')
      setError(false)
      setStored(null)
      setOperator(null)
    } else if (['+', '-', '×', '÷'].includes(key)) {
      const current = Number(value)
      if (operator && stored !== null && !waitingForOperand) {
        const result = calculate(stored, current, operator)
        if (result === null || !Number.isFinite(result)) { setValue('Cannot divide by zero'); setError(true); setOperator(null); return }
        setStored(result)
        setValue(String(result))
      } else if (stored === null) setStored(current)
      setOperator(key)
      setWaitingForOperand(true)
    }
  }
  return <div className="calculator"><input aria-label="Calculator display" readOnly value={value} /><div className="calc-mode"><button>Standard</button><button>Scientific</button></div><div className="calc-grid">{['MC','MR','M+','C','√','±','7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'].map((key) => <button key={key} onClick={() => press(key)}>{key}</button>)}</div></div>
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

function MediaPlayer({ compact = false }: { compact?: boolean }) {
  const [file, setFile] = useState('')
  const [playing, setPlaying] = useState(false)
  return <div className="media-player"><div className="menu-strip">File&nbsp;&nbsp; Device&nbsp;&nbsp; Play&nbsp;&nbsp; Help</div><div className="media-screen">{playing ? '▶ Playing' : '■ Stopped'}<small>{file || (compact ? 'Audio CD ready' : 'No media selected')}</small></div><div className="media-controls"><button onClick={() => setPlaying(false)}>■</button><button onClick={() => setPlaying(true)}>▶</button><button onClick={() => setPlaying(false)}>Ⅱ</button><label>Volume <input type="range" defaultValue="70" /></label></div>{!compact && <input className="media-file" placeholder="WAV, MIDI, AVI, or audio CD track" value={file} onChange={(event) => setFile(event.target.value)} />}</div>
}

function Printer() {
  const [jobs, setJobs] = useState<string[]>([])
  return <div className="printer-app"><div className="menu-strip">File&nbsp;&nbsp; Printer&nbsp;&nbsp; View&nbsp;&nbsp; Help</div><div className="printer-head"><span>🖨️</span><div><h3>Printers</h3><p>Manage your installed printers and print queue.</p></div></div><div className="printer-actions"><button onClick={() => setJobs((current) => [...current, `Document ${current.length + 1}.TXT`])}>Print test page</button><button onClick={() => setJobs([])}>Cancel all jobs</button></div><ul>{jobs.map((job) => <li key={job}>📄 {job} <small>Printing</small></li>)}</ul><div className="statusbar">{jobs.length} document(s) in queue &nbsp; • &nbsp; Microsoft Print to Web</div></div>
}

function FindFiles() {
  const [query, setQuery] = useState('')
  const results = listFiles().filter((file) => file.name.toLowerCase().includes(query.toLowerCase()))
  return <div className="find-app"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; Help</div><div className="find-form"><label>Named:</label><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} /><label>Look in:</label><select><option>My Computer</option><option>C:\WINDOWS\Desktop</option></select><button>Find Now</button></div><div className="find-results">{query ? results.map((file) => <div key={file.name}>📄 <b>{file.name}</b><small>C:\WINDOWS\Desktop</small></div>) : <p>Enter a file name to begin searching.</p>}</div><div className="statusbar">{query ? `${results.length} object(s) found` : 'Ready'}</div></div>
}

function SystemTools() {
  const [running, setRunning] = useState<string | null>(null)
  const tools = ['ScanDisk', 'Disk Defragmenter', 'DriveSpace', 'Backup', 'System Monitor', 'Resource Meter', 'Clipboard Viewer', 'Character Map', 'Sound Recorder', 'Phone Dialer']
  return <div className="system-tools"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help</div><div className="tool-list">{tools.map((tool) => <button key={tool} onClick={() => setRunning(tool)}><span>🛠️</span><b>{tool}</b><small>{running === tool ? 'Running...' : 'Double-click to open'}</small></button>)}</div>{running && <div className="tool-output"><b>{running}</b><p>{running} completed successfully. No problems were found on the virtual drive.</p><progress value={100} max={100} /></div>}<div className="statusbar">C:\ &nbsp; 12.4 MB free of 32 MB</div></div>
}

function CharacterMap() {
  const chars = '☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ΑΒΓΔΩαβγδεπσμτΦΘΩδ∞≠≤≥'.split('')
  return <div className="character-map"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; Help</div><div className="char-grid">{chars.map((char) => <button key={char} onClick={() => navigator.clipboard?.writeText(char)}>{char}</button>)}</div><p>Click a character to copy it to the clipboard.</p></div>
}

function ClipboardViewer() {
  const [text, setText] = useState('The Windows Clipboard is empty.')
  return <div className="clipboard-viewer"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help</div><textarea value={text} onChange={(event) => setText(event.target.value)} /><button onClick={() => setText('')}>Clear Clipboard</button></div>
}

function SoundRecorder() {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recording])
  return <div className="sound-recorder"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; Effects&nbsp;&nbsp; Help</div><div className="recorder-display">00:{String(seconds).padStart(2, '0')}<div className={recording ? 'wave active' : 'wave'}>▁▃▆▃▁▅▇▂▁▃▆</div></div><div className="recorder-controls"><button onClick={() => setRecording(false)}>■ Stop</button><button onClick={() => setRecording(true)}>● Record</button><button onClick={() => setSeconds(0)}>↶ Rewind</button></div></div>
}

function PhoneDialer() {
  const [number, setNumber] = useState('')
  const [status, setStatus] = useState('Ready')
  return <div className="phone-dialer"><div className="menu-strip">Phone&nbsp;&nbsp; Edit&nbsp;&nbsp; Help</div><input readOnly value={number} placeholder="Phone number" /><div className="dial-grid">{['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => <button key={key} onClick={() => setNumber((value) => value + key)}>{key}</button>)}</div><div className="dial-actions"><button onClick={() => setStatus(number ? `Dialing ${number}...` : 'Enter a number')}>Dial</button><button onClick={() => { setNumber(''); setStatus('Ready') }}>Hang Up</button></div><p>{status}</p></div>
}

function VolumeControl() {
  const [volume, setVolume] = useState(70)
  return <div className="volume-control"><div className="menu-strip">Options&nbsp;&nbsp; Help</div><div className="mixer-channel"><span>Master</span><input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /><b>{volume}%</b></div><div className="mixer-channel"><span>Wave</span><input type="range" defaultValue="80" /><b>80%</b></div><div className="mixer-channel"><span>MIDI</span><input type="range" defaultValue="60" /><b>60%</b></div></div>
}
