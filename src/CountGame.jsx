import { useState } from 'react'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './CountGame.css'

const THINGS = ['🍎', '🐟', '⭐', '🐞', '🍌', '🎈', '🐣', '🍓', '🦋', '🍪']

const TARGET = 5
const MOST = 9

const pick = (list) => list[Math.floor(Math.random() * list.length)]

function newRound() {
  const count = 1 + Math.floor(Math.random() * MOST)
  const options = [count]
  while (options.length < 3) {
    const guess = count + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3))
    if (guess >= 1 && guess <= MOST && !options.includes(guess)) options.push(guess)
  }
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  return { count, thing: pick(THINGS), options }
}

export default function CountGame() {
  const { faces, picking, setPicking, choose } = usePlayers()
  const [round, setRound] = useState(newRound)
  const [wrong, setWrong] = useState([])
  const [solved, setSolved] = useState(false)
  const [scores, setScores] = useState([0, 0])
  const [turn, setTurn] = useState(0)

  const matchOver = scores.some((score) => score === TARGET)

  const guess = (option) => {
    if (solved || matchOver || wrong.includes(option)) return
    if (option !== round.count) {
      setWrong((prev) => [...prev, option])
      return
    }
    // Counting it right first time wins the point; either way the turn passes.
    if (!wrong.length) {
      setScores((prev) => prev.map((n, i) => (i === turn ? n + 1 : n)))
    }
    setSolved(true)
  }

  const next = () => {
    if (matchOver) {
      setScores([0, 0])
      setTurn(0)
    } else if (solved) {
      setTurn(1 - turn)
    }
    setRound(newRound())
    setWrong([])
    setSolved(false)
  }

  if (picking !== null) {
    return (
      <div className="game count-game">
        <PlayerPicker faces={faces} picking={picking} onChoose={choose} />
      </div>
    )
  }

  return (
    <div className="game count-game">
      <PlayerBar
        faces={faces}
        turn={turn}
        over={matchOver}
        winners={SEATS.map((_, i) => matchOver && scores[i] === TARGET)}
        piles={scores.map((n, i) =>
          Array.from({ length: n }, (_, j) => ({ key: j, color: SEATS[i].color }))
        )}
        onPick={setPicking}
      />

      <div className={`things ${solved ? 'solved' : ''}`}>
        {Array.from({ length: round.count }, (_, i) => (
          <span key={i} style={{ '--i': i }}>
            {round.thing}
          </span>
        ))}
      </div>

      <div className="choices">
        {round.options.map((option) => (
          <button
            key={option}
            className={`choice ${wrong.includes(option) ? 'nope' : ''} ${
              solved && option === round.count ? 'yes' : ''
            }`}
            style={{ '--player-color': SEATS[turn].color }}
            aria-label={`${option}`}
            disabled={solved}
            onClick={() => guess(option)}
          >
            <span className="numeral">{option}</span>
            <span className="beads">
              {Array.from({ length: option }, (_, i) => (
                <i key={i} />
              ))}
            </span>
          </button>
        ))}
      </div>

      <button className="reset" onClick={next} aria-label="Next one">
        {matchOver ? '↺' : '→'}
      </button>
    </div>
  )
}
