import { useEffect, useState } from 'react'
import { COLORS } from './colors'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './MemoryGame.css'

// Twelve pairs plus one lucky star fill the 5x5 board.
const DECK = [
  'red', 'orange', 'yellow', 'lime', 'green', 'teal',
  'skyblue', 'blue', 'purple', 'magenta', 'pink', 'brown',
]

const STAR = 'star'

const hexOf = (id) =>
  id === STAR ? '#ffe9a8' : COLORS.find((c) => c.id === id).hex

function shuffledCards() {
  const cards = [
    ...DECK.flatMap((colorId) => [
      { key: `${colorId}-a`, colorId },
      { key: `${colorId}-b`, colorId },
    ]),
    { key: STAR, colorId: STAR },
  ]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

export default function MemoryGame() {
  const { faces, picking, setPicking, choose } = usePlayers()
  const [cards, setCards] = useState(shuffledCards)
  const [flipped, setFlipped] = useState([])
  const [won, setWon] = useState([[], []])
  const [turn, setTurn] = useState(0)

  const collected = won.flat()

  // A pair is judged once two cards are face up: keep it and go again,
  // or hand the turn over after a moment of looking at them.
  useEffect(() => {
    if (flipped.length < 2) return
    const [a, b] = flipped
    if (cards[a].colorId === cards[b].colorId) {
      setWon((prev) =>
        prev.map((pile, i) => (i === turn ? [...pile, cards[a].colorId] : pile))
      )
      setFlipped([])
      return
    }
    const timer = setTimeout(() => {
      setFlipped([])
      setTurn((prev) => 1 - prev)
    }, 1100)
    return () => clearTimeout(timer)
  }, [flipped, cards, turn])

  const over = collected.length === DECK.length + 1
  const best = Math.max(won[0].length, won[1].length)

  const flip = (index) => {
    const card = cards[index]
    if (flipped.length === 2 || flipped.includes(index)) return
    if (collected.includes(card.colorId)) return
    // The star belongs to whoever finds it, and they carry on.
    if (card.colorId === STAR) {
      setWon((prev) => prev.map((pile, i) => (i === turn ? [...pile, STAR] : pile)))
      return
    }
    setFlipped((prev) => [...prev, index])
  }

  const restart = () => {
    setCards(shuffledCards())
    setFlipped([])
    setWon([[], []])
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
        winners={SEATS.map((_, i) => over && won[i].length === best)}
        piles={won.map((pile) =>
          pile.map((colorId) => ({
            key: colorId,
            color: hexOf(colorId),
            pale: colorId === STAR,
          }))
        )}
        onPick={setPicking}
      />

      <div className="board">
        {cards.map((card, index) => {
          const isUp = flipped.includes(index) || collected.includes(card.colorId)
          return (
            <button
              key={card.key}
              className={`card ${isUp ? 'up' : ''} ${card.colorId === STAR ? 'star' : ''}`}
              style={{ '--card-color': hexOf(card.colorId) }}
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
