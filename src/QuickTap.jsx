import { useEffect, useState } from 'react'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './QuickTap.css'

const TARGET = 3

export default function QuickTap() {
  const { faces, picking, setPicking, choose } = usePlayers()
  const [phase, setPhase] = useState('ready')
  const [scores, setScores] = useState([0, 0])
  const [last, setLast] = useState(null)

  // The star lights up after an unpredictable little wait.
  useEffect(() => {
    if (phase !== 'set') return
    const timer = setTimeout(() => setPhase('go'), 1200 + Math.random() * 2600)
    return () => clearTimeout(timer)
  }, [phase])

  const matchOver = scores.some((score) => score === TARGET)

  const score = (player, reason) => {
    setScores((prev) => prev.map((n, i) => (i === player ? n + 1 : n)))
    setLast({ player, reason })
    setPhase('done')
  }

  const slap = (player) => {
    if (phase === 'go') score(player, 'quick')
    else if (phase === 'set') score(1 - player, 'early')
  }

  const startRound = () => {
    if (matchOver) {
      setScores([0, 0])
      setLast(null)
      setPhase('ready')
      return
    }
    setLast(null)
    setPhase('set')
  }

  if (picking !== null) {
    return (
      <div className="game tap-game">
        <PlayerPicker faces={faces} picking={picking} onChoose={choose} />
      </div>
    )
  }

  return (
    <div className="game tap-game">
      <PlayerBar
        faces={faces}
        turn={-1}
        over={matchOver}
        winners={SEATS.map((_, i) => matchOver && scores[i] === TARGET)}
        piles={scores.map((n, i) =>
          Array.from({ length: n }, (_, j) => ({ key: j, color: SEATS[i].color }))
        )}
        onPick={setPicking}
      />

      <div className="ring">
        <Pad seat={0} face={faces[0]} phase={phase} scored={last?.player === 0} onSlap={slap} />
        <button
          className={`star-light ${phase}`}
          aria-label={phase === 'go' ? 'tap now' : 'start'}
          onClick={startRound}
          disabled={phase === 'set' || phase === 'go'}
        >
          {phase === 'go' ? '⭐' : phase === 'set' ? '💤' : matchOver ? '↺' : '▶'}
        </button>
        <Pad seat={1} face={faces[1]} phase={phase} scored={last?.player === 1} onSlap={slap} />
      </div>
    </div>
  )
}

function Pad({ seat, face, phase, scored, onSlap }) {
  return (
    <button
      className={`pad ${phase} ${scored ? 'scored' : ''}`}
      style={{ '--player-color': SEATS[seat].color }}
      aria-label={`${face} taps here`}
      onClick={() => onSlap(seat)}
    >
      {face}
    </button>
  )
}
