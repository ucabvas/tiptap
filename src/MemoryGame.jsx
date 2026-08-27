import { useEffect, useState } from 'react'
import { COLORS } from './colors'
import './MemoryGame.css'

// Twelve pairs plus one lucky star fill the 5x5 board.
const DECK = [
  'red', 'orange', 'yellow', 'lime', 'green', 'teal',
  'skyblue', 'blue', 'purple', 'magenta', 'pink', 'brown',
]

const STAR = 'star'

const FACES = ['🦊', '🐼', '🐸', '🦁', '🐵', '🐷', '🐙', '🦄', '🐨', '🐝']

const SEATS = [{ color: '#ff8c1a' }, { color: '#7ec8f2' }]

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
  const [faces, setFaces] = useState([null, null])
  const [picking, setPicking] = useState(0)
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

  const choose = (face) => {
    setFaces((prev) => prev.map((f, i) => (i === picking ? face : f)))
    setPicking(picking === 0 && !faces[1] ? 1 : null)
  }

  if (picking !== null) {
    return (
      <div className="game memory-game">
        <div className="seats">
          {SEATS.map((seat, i) => (
            <span
              key={i}
              className={`seat ${picking === i ? 'choosing' : ''}`}
              style={{ '--player-color': seat.color }}
            >
              {faces[i] || ''}
            </span>
          ))}
        </div>

        <div className="faces">
          {FACES.filter((face) => !faces.includes(face) || faces[picking] === face).map(
            (face) => (
              <button
                key={face}
                className="face-pick"
                aria-label={`choose ${face}`}
                onClick={() => choose(face)}
              >
                {face}
              </button>
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="game memory-game">
      <div className="players">
        {SEATS.map((seat, i) => (
          <button
            key={i}
            className={`player ${!over && turn === i ? 'active' : ''} ${
              over && won[i].length === best ? 'winner' : ''
            }`}
            style={{ '--player-color': seat.color }}
            aria-label={`player ${i + 1}, change animal`}
            onClick={() => setPicking(i)}
          >
            <span className="face">{faces[i]}</span>
            <span className="pile">
              {won[i].map((colorId) => (
                <i
                  key={colorId}
                  className={colorId === STAR ? 'star-dot' : ''}
                  style={{ background: hexOf(colorId) }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>

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
