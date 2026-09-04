import { useEffect, useState } from 'react'
import { LevelButton, NumberCards, TypeBox, typedDigit } from './Answer'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './Answer.css'
import './SumGame.css'

const THINGS = ['🍎', '🐟', '⭐', '🐞', '🍌', '🎈', '🐣', '🍓', '🦋', '🍪']

const TARGET = 5
const MOST = 10

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Half the rounds add two groups, half take some of one group away.
function newRound() {
  const thing = pick(THINGS)
  if (Math.random() < 0.5) {
    const left = 1 + Math.floor(Math.random() * 5)
    const right = 1 + Math.floor(Math.random() * Math.min(5, MOST - left))
    return { kind: 'add', thing, left, right, answer: left + right }
  }
  const from = 3 + Math.floor(Math.random() * (MOST - 3))
  const gone = 1 + Math.floor(Math.random() * (from - 1))
  return { kind: 'take', thing, from, gone, answer: from - gone }
}

function options(answer) {
  const list = [answer]
  while (list.length < 3) {
    const guess = answer + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2))
    if (guess >= 1 && guess <= MOST && !list.includes(guess)) list.push(guess)
  }
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

const deal = () => {
  const round = newRound()
  return { ...round, options: options(round.answer) }
}

export default function SumGame({ players }) {
  const { faces, picking, setPicking, choose } = usePlayers(players)
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(deal)
  const [wrong, setWrong] = useState([])
  const [missed, setMissed] = useState(false)
  const [solved, setSolved] = useState(false)
  const [scores, setScores] = useState(() => Array(players).fill(0))
  const [turn, setTurn] = useState(0)

  const matchOver = scores.some((score) => score === TARGET)

  const guess = (option) => {
    if (solved || matchOver || wrong.includes(option)) return
    if (option !== round.answer) {
      setWrong((prev) => [...prev, option])
      setMissed(true)
      return
    }
    if (!missed) {
      setScores((prev) => prev.map((n, i) => (i === turn ? n + 1 : n)))
    }
    setSolved(true)
  }

  useEffect(() => {
    if (level !== 2 || solved || matchOver) return
    const onKey = (event) => {
      const digit = typedDigit(event)
      if (digit) guess(digit)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // A wrong number lingers for a moment, then clears for the next try.
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
      setRound(deal())
      setWrong([])
      setMissed(false)
      setSolved(false)
    }, 1100)
    return () => clearTimeout(timer)
  }, [solved, matchOver, players])

  const restart = () => {
    setScores(Array(players).fill(0))
    setTurn(0)
    setRound(deal())
    setWrong([])
    setMissed(false)
    setSolved(false)
  }

  const changeLevel = (next) => {
    setLevel(next)
    setRound(deal())
    setWrong([])
    setMissed(false)
    setSolved(false)
  }

  if (picking !== null) {
    return (
      <div className="game sum-game">
        <PlayerPicker faces={faces} picking={picking} onChoose={choose} />
      </div>
    )
  }

  const typed = wrong[wrong.length - 1]

  return (
    <div className="game sum-game">
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

      <div className={`sum ${solved ? 'solved' : ''}`}>
        {round.kind === 'add' ? (
          <>
            <Group thing={round.thing} count={round.left} />
            <span className="sign">+</span>
            <Group thing={round.thing} count={round.right} from={round.left} />
          </>
        ) : (
          <Group thing={round.thing} count={round.from} gone={round.gone} />
        )}
      </div>

      {level === 1 ? (
        <NumberCards
          options={round.options}
          answer={round.answer}
          wrong={wrong}
          solved={solved}
          color={SEATS[turn].color}
          onGuess={guess}
        />
      ) : (
        <TypeBox answer={round.answer} typed={typed} solved={solved} color={SEATS[turn].color} />
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

// The last `gone` things have been eaten, so they fade out of the count.
function Group({ thing, count, gone = 0, from = 0 }) {
  return (
    <span className="group">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={i >= count - gone ? 'gone' : ''}
          style={{ '--i': from + i }}
        >
          {thing}
        </span>
      ))}
    </span>
  )
}
