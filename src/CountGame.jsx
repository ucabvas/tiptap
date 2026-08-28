import { useEffect, useState } from 'react'
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
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(newRound)
  const [wrong, setWrong] = useState([])
  const [missed, setMissed] = useState(false)
  const [solved, setSolved] = useState(false)
  const [scores, setScores] = useState([0, 0])
  const [turn, setTurn] = useState(0)

  const matchOver = scores.some((score) => score === TARGET)

  const guess = (option) => {
    if (solved || matchOver || wrong.includes(option)) return
    if (option !== round.count) {
      setWrong((prev) => [...prev, option])
      setMissed(true)
      return
    }
    // Counting it right first time wins the point; either way the turn passes.
    if (!missed) {
      setScores((prev) => prev.map((n, i) => (i === turn ? n + 1 : n)))
    }
    setSolved(true)
  }

  // Level two: no cards to choose from, just type the number.
  useEffect(() => {
    if (level !== 2 || solved || matchOver) return
    const onKey = (event) => {
      const digit = Number(event.key)
      if (!event.key.match(/^[0-9]$/) || digit === 0) return
      event.preventDefault()
      guess(digit)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // A wrong number fades away so the next try starts clean.
  useEffect(() => {
    if (level !== 2 || !wrong.length) return
    const timer = setTimeout(() => setWrong([]), 700)
    return () => clearTimeout(timer)
  }, [level, wrong])

  const next = () => {
    if (matchOver) {
      setScores([0, 0])
      setTurn(0)
    } else if (solved) {
      setTurn(1 - turn)
    }
    setRound(newRound())
    setWrong([])
    setMissed(false)
    setSolved(false)
  }

  const swapLevel = () => {
    setLevel(level === 1 ? 2 : 1)
    setWrong([])
    setMissed(false)
    setSolved(false)
    setRound(newRound())
  }

  if (picking !== null) {
    return (
      <div className="game count-game">
        <PlayerPicker faces={faces} picking={picking} onChoose={choose} />
      </div>
    )
  }

  const typed = wrong[wrong.length - 1]

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

      {level === 1 ? (
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
      ) : (
        <div
          className={`typed ${solved ? 'yes' : ''} ${typed ? 'nope' : ''}`}
          style={{ '--player-color': SEATS[turn].color }}
          aria-label="type the number"
        >
          <span className="numeral">
            {solved ? round.count : typed || <i className="caret" />}
          </span>
        </div>
      )}

      <div className="tray">
        <button className="reset" onClick={next} aria-label="Next one">
          {matchOver ? '↺' : '→'}
        </button>
        <button
          className="level"
          onClick={swapLevel}
          aria-label={level === 1 ? 'switch to typing' : 'switch to number cards'}
        >
          {level === 1 ? '1' : '2'}
        </button>
      </div>
    </div>
  )
}
