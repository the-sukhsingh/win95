import { useMemo, useState } from 'react'
import { listFiles, readFile } from '../../lib/vfs'

export function Terminal() {
  const [lines, setLines] = useState(['Microsoft(R) Windows 95', '(C)Copyright Microsoft Corp 1981-1995.', '', 'C:\\WINDOWS> Type "help" for a list of commands.'])
  const [value, setValue] = useState('')
  const [path, setPath] = useState('C:\\WINDOWS')
  const commands = useMemo(() => ({
    help: 'DIR  TYPE  CD  CLS  VER  MATRIX  ABOUT',
    ver: 'Windows 95 Web Edition [Version 4.00.950]',
    dir: () => listFiles().map((file) => `${file.type === 'folder' ? '<DIR>' : '     '}  ${file.name}`).join('\r\n'),
    about: 'A browser-native operating system. Files persist locally in your profile.',
    matrix: 'Wake up, Neo... the Matrix has you.',
    cd: 'C:\\WINDOWS',
  }), [])
  const run = () => {
    const raw = value.trim()
    const [command, ...args] = raw.toLowerCase().split(/\s+/)
    if (!command) return
    let output = commands[command as keyof typeof commands]
    if (command === 'cls') { setLines([]); setValue(''); return }
    if (command === 'cd') { setPath(args[0] ? `C:\\${args[0].toUpperCase()}` : 'C:\\WINDOWS'); output = '' }
    if (command === 'type') output = readFile(args[0] ?? '') || 'File not found.'
    if (typeof output === 'function') output = output()
    setLines((current) => [...current, `${path}>${raw}`, output || `'${command}' is not recognized as an internal command.`])
    setValue('')
  }
  return <div className="terminal"><div className="terminal-output">{lines.map((line, index) => <div key={`${line}-${index}`}>{line || '\u00a0'}</div>)}</div><div className="terminal-input"><span>{path}&gt;</span><input autoFocus value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && run()} /></div></div>
}
