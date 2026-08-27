import { useState } from 'react'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './ThreeInARow.css'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

const winningLine = (board) =>
  LINES.find(([a, b, c]) => board[a] !== null && board[a] === board[b] && board[b] === board[c])

export default function ThreeInARow() {
  const { faces, picking, setPicking, choose } = usePlayers()
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(0)
  const [rounds, setRounds] = useState([[], []])
  const [starter, setStarter] = useState(0)

  const line = winningLine(board)
  const champion = line ? board[line[0]] : null
  const full = board.every((cell) => cell !== null)
  const over = champion !== null || full

  const place = (index) => {
    if (over || board[index] !== null) return
    const next = board.map((cell, i) => (i === index ? turn : cell))
    setBoard(next)
    const finished = winningLine(next)
    if (finished) {
      const winner = next[finished[0]]
      setRounds((prev) =>
        prev.map((pile, i) => (i === winner ? [...pile, pile.length] : pile))
      )
      return
    }
    setTurn(1 - turn)
  }

  // Whoever went second last time gets to start the next round.
  const nextRound = () => {
    const first = 1 - starter
    setStarter(first)
    setTurn(first)
    setBoard(Array(9).fill(null))
  }

  if (picking !== null) {
    return (
      <div className="game row-game">
        <PlayerPicker faces={faces} picking={picking} onChoose={choose} />
      </div>
    )
  }

  return (
    <div className="game row-game">
      <PlayerBar
        faces={faces}
        turn={turn}
        over={over}
        winners={SEATS.map((_, i) => champion === i)}
        piles={rounds.map((pile, i) =>
          pile.map((key) => ({ key, color: SEATS[i].color }))
        )}
        onPick={setPicking}
      />

      <div className="grid">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`spot ${line?.includes(index) ? 'shine' : ''}`}
            style={{
              '--player-color': cell === null ? 'transparent' : SEATS[cell].color,
              '--i': index,
            }}
            aria-label={cell === null ? 'empty spot' : `${faces[cell]} here`}
            onClick={() => place(index)}
          >
            {cell === null ? '' : faces[cell]}
          </button>
        ))}
      </div>

      <button className="reset" onClick={nextRound} aria-label="Play again">
        ↺
      </button>
    </div>
  )
}
