import { useEffect, useState } from 'react'
import { LevelButton, NumberCards, TypeBox, typedDigit } from './Answer'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './Answer.css'
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

export default function CountGame({ players }) {
  const { faces, picking, setPicking, choose } = usePlayers(players)
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(newRound)
  const [wrong, setWrong] = useState([])
  const [missed, setMissed] = useState(false)
  const [solved, setSolved] = useState(false)
  const [scores, setScores] = useState(() => Array(players).fill(0))
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
      const digit = typedDigit(event)
      if (digit) guess(digit)
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

  // Getting it right moves on by itself after a moment to celebrate;
  // reaching the target instead waits for a deliberate restart.
  useEffect(() => {
    if (!solved || matchOver) return
    const timer = setTimeout(() => {
      setTurn((prev) => (prev + 1) % players)
      setRound(newRound())
      setWrong([])
      setMissed(false)
      setSolved(false)
    }, 1100)
    return () => clearTimeout(timer)
  }, [solved, matchOver, players])

  const restart = () => {
    setScores(Array(players).fill(0))
    setTurn(0)
    setRound(newRound())
    setWrong([])
    setMissed(false)
    setSolved(false)
  }

  const changeLevel = (next) => {
    setLevel(next)
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
        winners={scores.map((score) => matchOver && score === TARGET)}
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
        <NumberCards
          options={round.options}
          answer={round.count}
          wrong={wrong}
          solved={solved}
          color={SEATS[turn].color}
          onGuess={guess}
        />
      ) : (
        <TypeBox answer={round.count} typed={typed} solved={solved} color={SEATS[turn].color} />
      )}

      <div className="tray">
        <button className="reset" onClick={restart} aria-label="Start over">
          ↺
        </button>
        <LevelButton level={level} onSelect={changeLevel} />
      </div>
    </div>
  )
}
