import { useMemo, useState } from 'react'

const suits = ['♠', '♥', '♦', '♣']
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
type Card = { rank: string; suit: string; red: boolean }

function makeDeck(): Card[] {
  return suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit, red: suit === '♥' || suit === '♦' })))
}

export function Solitaire({ freeCell = false }: { freeCell?: boolean }) {
  const [deck, setDeck] = useState(() => makeDeck().sort(() => Math.random() - 0.5))
  const [selected, setSelected] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const visible = useMemo(() => deck.slice(0, freeCell ? 16 : 14), [deck, freeCell])
  const deal = () => { setDeck(makeDeck().sort(() => Math.random() - 0.5)); setSelected(null); setMoves(0) }
  const choose = (index: number) => { setSelected(index === selected ? null : index); if (selected !== null && index !== selected) setMoves((value) => value + 1) }
  return <div className={`cards-game ${freeCell ? 'freecell' : ''}`}><div className="menu-strip">Game&nbsp;&nbsp; Help <button onClick={deal}>New Game</button></div><div className="cards-toolbar"><span>{freeCell ? 'FreeCell' : 'Solitaire'}</span><span>Moves: {moves}</span></div><div className="card-table"><div className="card-row">{visible.slice(0, 7).map((card, index) => <button key={`${card.rank}-${card.suit}`} className={`playing-card ${card.red ? 'red' : ''} ${selected === index ? 'chosen' : ''}`} onClick={() => choose(index)}>{card.rank}<br />{card.suit}</button>)}</div><div className="card-row tableau">{visible.slice(7).map((card, index) => <button key={`${card.rank}-${card.suit}`} className={`playing-card ${card.red ? 'red' : ''}`} onClick={() => choose(index + 7)}>{card.rank}<br />{card.suit}</button>)}</div></div><div className="statusbar">Double-click a card to move it to a foundation.</div></div>
}
