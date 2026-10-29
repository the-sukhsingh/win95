import { useState } from 'react'

const homePage = 'https://www.windows93.net/'

export function InternetExplorer() {
  const [address, setAddress] = useState(homePage)
  const [location, setLocation] = useState(homePage)
  const [history, setHistory] = useState<string[]>([homePage])
  const [historyIndex, setHistoryIndex] = useState(0)

  const navigate = (next = address) => {
    const url = next.trim().match(/^https?:\/\//i) ? next.trim() : `https://${next.trim()}`
    setAddress(url)
    setLocation(url)
    setHistory((current) => [...current.slice(0, historyIndex + 1), url])
    setHistoryIndex((current) => current + 1)
  }

  const goBack = () => {
    if (historyIndex === 0) return
    const nextIndex = historyIndex - 1
    setHistoryIndex(nextIndex)
    setAddress(history[nextIndex] ?? homePage)
    setLocation(history[nextIndex] ?? homePage)
  }

  const goForward = () => {
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    setHistoryIndex(nextIndex)
    setAddress(history[nextIndex] ?? homePage)
    setLocation(history[nextIndex] ?? homePage)
  }

  return (
    <div className="internet-explorer">
      <div className="ie-toolbar">
        <button disabled={historyIndex === 0} onClick={goBack} title="Back">◀</button>
        <button disabled={historyIndex >= history.length - 1} onClick={goForward} title="Forward">▶</button>
        <button onClick={() => setLocation(location)} title="Refresh">↻</button>
        <button onClick={() => navigate(homePage)} title="Home">⌂</button>
        <form onSubmit={(event) => { event.preventDefault(); navigate() }}>
          <label>Address</label>
          <input value={address} onChange={(event) => setAddress(event.target.value)} />
          <button type="submit">Go</button>
        </form>
      </div>
      <div className="ie-favorites">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Favorites&nbsp;&nbsp; Tools&nbsp;&nbsp; Help</div>
      <iframe key={location} title="Internet Explorer 3.0 browser window" src={location} />
      <div className="ie-status">Done &nbsp; | &nbsp; Internet &nbsp; | &nbsp; {location}</div>
    </div>
  )
}
