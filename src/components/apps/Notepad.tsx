import { useState } from 'react'
import { readFile, writeFile } from '../../lib/vfs'

export function Notepad() {
  const [text, setText] = useState(() => readFile('README.TXT'))
  const [saved, setSaved] = useState(false)
  const save = () => { writeFile('README.TXT', text); setSaved(true); window.setTimeout(() => setSaved(false), 1200) }
  const download = () => { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'README.TXT'; anchor.click(); URL.revokeObjectURL(url) }
  return <div className="notepad"><div className="menu-strip">File&nbsp;&nbsp; Edit&nbsp;&nbsp; Search&nbsp;&nbsp; Help</div><textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} /><div className="notepad-actions"><button onClick={save}>Save</button><button onClick={download}>Save as .TXT</button><span>{saved ? 'Saved to C:\\WINDOWS\\Desktop' : `${text.length} characters`}</span></div></div>
}
