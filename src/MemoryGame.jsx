import { useEffect, useState } from 'react'
import { COLORS } from './colors'
import './MemoryGame.css'

const DECK = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']

const hexOf = (id) => COLORS.find((c) => c.id === id).hex

function shuffledCards() {
  const cards = DECK.flatMap((colorId) => [
    { key: `${colorId}-a`, colorId },
    { key: `${colorId}-b`, colorId },
  ])
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

export default function MemoryGame() {
  const [cards, setCards] = useState(shuffledCards)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])

  // A wrong pair stays visible for a moment, then turns back over.
  useEffect(() => {
    if (flipped.length < 2) return
    const [a, b] = flipped
    if (cards[a].colorId === cards[b].colorId) {
      setMatched((prev) => [...prev, cards[a].colorId])
      setFlipped([])
      return
    }
    const timer = setTimeout(() => setFlipped([]), 1100)
    return () => clearTimeout(timer)
  }, [flipped, cards])

  const won = matched.length === DECK.length

  const flip = (index) => {
    if (flipped.length === 2 || flipped.includes(index)) return
    if (matched.includes(cards[index].colorId)) return
    setFlipped((prev) => [...prev, index])
  }

  const restart = () => {
    setCards(shuffledCards())
    setFlipped([])
    setMatched([])
  }

  return (
    <div className="game memory-game">
      <div className={`board ${won ? 'won' : ''}`}>
        {cards.map((card, index) => {
          const isUp = flipped.includes(index) || matched.includes(card.colorId)
          return (
            <button
              key={card.key}
              className={`card ${isUp ? 'up' : ''}`}
              style={{ '--card-color': hexOf(card.colorId), '--i': index }}
              aria-label={isUp ? card.colorId : 'hidden card'}
              onClick={() => flip(index)}
            />
          )
        })}
      </div>

      <button className="reset" onClick={restart} aria-label="Play again">
        ↺
      </button>
    </div>
  )
}
