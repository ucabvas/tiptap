import { useState } from 'react'
import { typedDigit } from './Answer'
import './SudokuGame.css'

const SIZE = 9
const BOX = 3
const MIN_EMPTY = 10
const MAX_EMPTY = 60
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function shuffled(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Fills a full valid grid with randomized backtracking, then blanks
// `emptyCount` cells to make the puzzle.
function makePuzzle(emptyCount) {
  const solution = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))

  const fits = (row, col, value) => {
    for (let i = 0; i < SIZE; i++) {
      if (solution[row][i] === value || solution[i][col] === value) return false
    }
    const boxRow = row - (row % BOX)
    const boxCol = col - (col % BOX)
    for (let r = boxRow; r < boxRow + BOX; r++) {
      for (let c = boxCol; c < boxCol + BOX; c++) {
        if (solution[r][c] === value) return false
      }
    }
    return true
  }

  const fill = (index) => {
    if (index === SIZE * SIZE) return true
    const row = Math.floor(index / SIZE)
    const col = index % SIZE
    for (const value of shuffled(DIGITS)) {
      if (fits(row, col, value)) {
        solution[row][col] = value
        if (fill(index + 1)) return true
        solution[row][col] = 0
      }
    }
    return false
  }
  fill(0)

  const given = solution.map((row) => [...row])
  for (const cell of shuffled(Array.from({ length: SIZE * SIZE }, (_, i) => i)).slice(
    0,
    emptyCount
  )) {
    given[Math.floor(cell / SIZE)][cell % SIZE] = 0
  }

  return { given, board: given.map((row) => [...row]) }
}

// True if this cell's value also sits somewhere else in its row,
// column, or box -- the actual sudoku rule, not "matches the answer".
function conflictsAt(board, row, col) {
  const value = board[row][col]
  if (!value) return false
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i] === value) return true
    if (i !== row && board[i][col] === value) return true
  }
  const boxRow = row - (row % BOX)
  const boxCol = col - (col % BOX)
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return true
    }
  }
  return false
}

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState(MIN_EMPTY)
  const [puzzle, setPuzzle] = useState(() => makePuzzle(MIN_EMPTY))
  const [selected, setSelected] = useState(null)

  const { given, board } = puzzle

  const complete = board.every((row) => row.every((value) => value !== 0))
  const hasConflict = board.some((row, r) => row.some((_, c) => conflictsAt(board, r, c)))
  const won = complete && !hasConflict

  const select = (row, col) => {
    if (given[row][col] || won) return
    if (selected?.row === row && selected?.col === col) {
      setSelected(null)
      return
    }
    setSelected({ row, col })
  }

  const answer = (value) => {
    if (!selected || won) return
    const { row, col } = selected
    setPuzzle((prev) => {
      const next = prev.board.map((r) => [...r])
      next[row][col] = value
      return { ...prev, board: next }
    })
    setSelected(null)
  }

  const restart = () => setPuzzle(makePuzzle(difficulty))

  const changeDifficulty = (event) => setDifficulty(Number(event.target.value))
  const commitDifficulty = () => setPuzzle(makePuzzle(difficulty))

  const onKeyDown = (event) => {
    const digit = typedDigit(event)
    if (digit) answer(digit)
  }

  return (
    <div className="game sudoku-game" onKeyDown={onKeyDown}>
      <div className={`board ${won ? 'won' : ''}`}>
        {board.map((row, r) =>
          row.map((value, c) => {
            const isGiven = given[r][c] !== 0
            const isSelected = selected?.row === r && selected?.col === c
            const isConflict = conflictsAt(board, r, c)
            return (
              <button
                key={`${r}-${c}`}
                className={`cell ${isGiven ? 'given' : ''} ${isSelected ? 'selected' : ''} ${
                  value && !isGiven ? 'filled' : ''
                } ${isConflict ? 'conflict' : ''} ${
                  c % BOX === BOX - 1 && c !== SIZE - 1 ? 'box-right' : ''
                } ${r % BOX === BOX - 1 && r !== SIZE - 1 ? 'box-bottom' : ''}`}
                aria-label={value ? `${value}` : 'empty square'}
                disabled={isGiven}
                onClick={() => select(r, c)}
              >
                {value || ''}
              </button>
            )
          })
        )}

        {selected && (
          <>
            <button
              className="overlay-backdrop"
              aria-label="close"
              onClick={() => setSelected(null)}
            />
            <div
              className="digit-overlay"
              style={{ '--r': selected.row, '--c': selected.col }}
            >
              {DIGITS.map((digit) => (
                <button key={digit} onClick={() => answer(digit)}>
                  {digit}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="tray">
        <button className="reset" onClick={restart} aria-label="New puzzle">
          ↺
        </button>
        <div className="difficulty">
          <span>🙂</span>
          <input
            type="range"
            min={MIN_EMPTY}
            max={MAX_EMPTY}
            step={5}
            value={difficulty}
            onChange={changeDifficulty}
            onMouseUp={commitDifficulty}
            onTouchEnd={commitDifficulty}
            onKeyUp={commitDifficulty}
            aria-label="difficulty"
          />
          <span>🥵</span>
        </div>
      </div>
    </div>
  )
}
