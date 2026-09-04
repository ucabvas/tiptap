import { useEffect, useState } from 'react'
import { PlayerBar, PlayerPicker, usePlayers } from './Players'
import './MemoryGame.css'

// Twelve pairs plus one lucky star fill the 5x5 board.
const DECK = ['🐶', '🐱', '🐰', '🐢', '🍎', '🍌', '🍓', '🚗', '🚀', '⚽', '🌻', '🎈']

const STAR = '⭐'

function shuffledCards() {
  const cards = [
    ...DECK.flatMap((face) => [
      { key: `${face}-a`, face },
      { key: `${face}-b`, face },
    ]),
    { key: STAR, face: STAR },
  ]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

export default function MemoryGame({ players }) {
  const { faces, picking, setPicking, choose } = usePlayers(players)
  const [cards, setCards] = useState(shuffledCards)
  const [flipped, setFlipped] = useState([])
  const [won, setWon] = useState(() => Array.from({ length: players }, () => []))
  const [turn, setTurn] = useState(0)

  const collected = won.flat()

  // A pair is judged once two cards are face up: keep it and go again,
  // or hand the turn over after a moment of looking at them.
  useEffect(() => {
    if (flipped.length < 2) return
    const [a, b] = flipped
    if (cards[a].face === cards[b].face) {
      setWon((prev) => prev.map((pile, i) => (i === turn ? [...pile, cards[a].face] : pile)))
      setFlipped([])
      return
    }
    const timer = setTimeout(() => {
      setFlipped([])
      setTurn((prev) => (prev + 1) % players)
    }, 1100)
    return () => clearTimeout(timer)
  }, [flipped, cards, turn, players])

  const over = collected.length === DECK.length + 1
  const best = Math.max(...won.map((pile) => pile.length))

  const flip = (index) => {
    const card = cards[index]
    if (flipped.length === 2 || flipped.includes(index)) return
    if (collected.includes(card.face)) return
    // The star belongs to whoever finds it, and they carry on.
    if (card.face === STAR) {
      setWon((prev) => prev.map((pile, i) => (i === turn ? [...pile, STAR] : pile)))
      return
    }
    setFlipped((prev) => [...prev, index])
  }

  const restart = () => {
    setCards(shuffledCards())
    setFlipped([])
    setWon(Array.from({ length: players }, () => []))
    setTurn(0)
  }

  if (picking !== null) {
    return (
      <div className="game memory-game">
        <PlayerPicker faces={faces} picking={picking} onChoose={choose} />
      </div>
    )
  }

  return (
    <div className="game memory-game">
      <PlayerBar
        faces={faces}
        turn={turn}
        over={over}
        winners={won.map((pile) => over && pile.length === best)}
        piles={won.map((pile) => pile.map((face) => ({ key: face, face })))}
        onPick={setPicking}
      />

      <div className="board">
        {cards.map((card, index) => {
          const isUp = flipped.includes(index) || collected.includes(card.face)
          return (
            <button
              key={card.key}
              className={`card ${isUp ? 'up' : ''} ${card.face === STAR ? 'star' : ''}`}
              aria-label={isUp ? card.face : 'hidden card'}
              onClick={() => flip(index)}
            >
              {isUp && <span className="glyph">{card.face}</span>}
            </button>
          )
        })}
      </div>

      <button className="reset" onClick={restart} aria-label="Play again">
        ↺
      </button>
    </div>
  )
}
