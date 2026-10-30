import { useState } from 'react'
import { readFile, writeFile } from '../../lib/vfs'

export function Notepad() {
  const [text, setText] = useState(() => readFile('README.TXT'))
  const [filename, setFilename] = useState('README.TXT')
  const [saved, setSaved] = useState(false)
  const save = () => { writeFile(filename, text); setSaved(true); window.setTimeout(() => setSaved(false), 1200) }
  const download = () => { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url) }
  const open = () => { const name = window.prompt('Open text file:', filename); if (name) { setFilename(name); setText(readFile(name)) } }
  const find = () => { const query = window.prompt('Find:'); if (query) { const index = text.toLowerCase().indexOf(query.toLowerCase()); window.alert(index >= 0 ? `Found at character ${index + 1}.` : 'Cannot find the specified text.') } }
  return <div className="notepad"><div className="menu-strip"><button onClick={open}>Open</button><button onClick={save}>Save</button><button onClick={download}>Save As</button><button onClick={find}>Find</button><button onClick={() => window.print()}>Print</button><span>{filename}</span></div><textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} wrap="soft" /><div className="notepad-actions"><label><input type="checkbox" defaultChecked /> Word wrap</label><span>{saved ? `Saved to C:\\WINDOWS\\Desktop\\${filename}` : `${text.length} characters`}</span></div></div>
}
