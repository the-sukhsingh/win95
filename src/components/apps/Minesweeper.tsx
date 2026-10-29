import { useEffect, useMemo, useState } from 'react'
import { isMine, isWin, newBoard, reveal, toggleFlag, type Difficulty } from '../../lib/games/minesweeper'

export function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [board, setBoard] = useState(() => newBoard('beginner'))
  const [status, setStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready')
  const [seconds, setSeconds] = useState(0)
  const flags = useMemo(() => board.cells.filter((cell) => cell.flagged).length, [board])

  useEffect(() => {
    if (status !== 'playing') return
    const timer = window.setInterval(() => setSeconds((value) => Math.min(999, value + 1)), 1000)
    return () => window.clearInterval(timer)
  }, [status])

  const reset = (nextDifficulty = difficulty) => {
    setDifficulty(nextDifficulty)
    setBoard(newBoard(nextDifficulty))
    setStatus('ready')
    setSeconds(0)
  }

  const clickCell = (index: number) => {
    if (status === 'won' || status === 'lost' || board.cells[index]?.flagged) return
    if (status === 'ready') setStatus('playing')
    if (isMine(board, index)) { setStatus('lost'); setBoard({ ...board, cells: board.cells.map((cell) => cell.mine ? { ...cell, open: true } : cell) }); return }
    const next = reveal(board, index)
    setBoard(next)
    if (isWin(next)) setStatus('won')
  }

  return <div className={`minesweeper ${difficulty}`}><div className="game-toolbar"><label>Game <select value={difficulty} onChange={(event) => reset(event.target.value as Difficulty)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option></select></label><span>{status === 'won' ? 'You win!' : status === 'lost' ? 'Boom!' : status === 'playing' ? 'In progress' : 'Ready'}</span></div><div className="mine-head"><span>{String(Math.max(0, board.mines - flags)).padStart(3, '0')}</span><button aria-label="New game" onClick={() => reset()}>{status === 'lost' ? '☹' : status === 'won' ? '😎' : '☺'}</button><span>{String(seconds).padStart(3, '0')}</span></div><div className="mine-grid" style={{ gridTemplateColumns: `repeat(${board.columns}, 28px)` }}>{board.cells.map((cell, index) => <button key={index} className={`mine-cell ${cell.open ? 'open' : ''} n${cell.adjacent}`} onClick={() => clickCell(index)} onContextMenu={(event) => { event.preventDefault(); if (status !== 'lost' && status !== 'won') setBoard(toggleFlag(board, index)) }}>{cell.open ? cell.mine ? '💣' : cell.adjacent || '' : cell.flagged ? '⚑' : ''}</button>)}</div><p>Left-click to reveal · Right-click to flag</p></div>
}
