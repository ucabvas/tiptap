import { useEffect, useState } from 'react'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './ThreeInARow.css'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

const CORNERS = [0, 2, 6, 8]

const winningLine = (board) =>
  LINES.find(([a, b, c]) => board[a] !== null && board[a] === board[b] && board[b] === board[c])

// A friendly-not-perfect opponent: take a win, block a loss, else favor
// the center and corners so a small kid still has a real shot at winning.
function robotMove(board) {
  const open = board.flatMap((cell, i) => (cell === null ? [i] : []))
  for (const i of open) {
    if (winningLine(board.map((c, j) => (j === i ? 1 : c)))) return i
  }
  for (const i of open) {
    if (winningLine(board.map((c, j) => (j === i ? 0 : c)))) return i
  }
  if (board[4] === null) return 4
  const openCorners = CORNERS.filter((i) => board[i] === null)
  if (openCorners.length) return openCorners[Math.floor(Math.random() * openCorners.length)]
  return open[Math.floor(Math.random() * open.length)]
}

export default function ThreeInARow({ players }) {
  const { faces, picking, setPicking, choose } = usePlayers(players)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(0)
  const [rounds, setRounds] = useState([[], []])
  const [starter, setStarter] = useState(0)

  const boardFaces = players === 1 ? [faces[0], '🤖'] : faces

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

  // The robot takes its turn a beat after the board updates, so its move
  // reads like a little decision rather than an instant reflex.
  useEffect(() => {
    if (picking !== null || players !== 1 || over || turn !== 1) return
    const timer = setTimeout(() => place(robotMove(board)), 550)
    return () => clearTimeout(timer)
  }, [picking, players, over, turn, board])

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
        faces={boardFaces}
        turn={turn}
        over={over}
        winners={SEATS.map((_, i) => champion === i)}
        piles={rounds.map((pile, i) =>
          pile.map((key) => ({ key, color: SEATS[i].color }))
        )}
        onPick={players === 1 ? () => setPicking(0) : setPicking}
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
            aria-label={cell === null ? 'empty spot' : `${boardFaces[cell]} here`}
            onClick={() => {
              if (players === 1 && turn === 1) return
              place(index)
            }}
          >
            {cell === null ? '' : boardFaces[cell]}
          </button>
        ))}
      </div>

      <button className="reset" onClick={nextRound} aria-label="Play again">
        ↺
      </button>
    </div>
  )
}
