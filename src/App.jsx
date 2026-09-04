import { useState } from 'react'
import MixGame from './MixGame'
import MemoryGame from './MemoryGame'
import ThreeInARow from './ThreeInARow'
import QuickTap from './QuickTap'
import CountGame from './CountGame'
import DragSort from './DragSort'
import SumGame from './SumGame'
import SudokuGame from './SudokuGame'
import './App.css'

const GAMES = [
  {
    key: 'mix',
    label: 'Mixing colors',
    Component: MixGame,
    modes: ['single', 'multi'],
    art: (
      <span className="tile-art mix-art">
        <i style={{ background: '#ffd60a' }} />
        <i style={{ background: '#1d75d6' }} />
      </span>
    ),
  },
  {
    key: 'memory',
    label: 'Matching pairs',
    Component: MemoryGame,
    modes: ['single', 'multi'],
    art: (
      <span className="tile-art memory-art">
        <i style={{ background: '#e63946' }} />
        <i style={{ background: '#2fb457' }} />
        <i style={{ background: '#2fb457' }} />
        <i style={{ background: '#e63946' }} />
      </span>
    ),
  },
  {
    key: 'row',
    label: 'Three in a row',
    Component: ThreeInARow,
    modes: ['single', 'multi'],
    art: (
      <span className="tile-art row-art">
        <i style={{ background: '#ff8c1a' }} />
        <i />
        <i style={{ background: '#7ec8f2' }} />
        <i />
        <i style={{ background: '#ff8c1a' }} />
        <i />
        <i style={{ background: '#7ec8f2' }} />
        <i />
        <i style={{ background: '#ff8c1a' }} />
      </span>
    ),
  },
  {
    key: 'tap',
    label: 'Quick tap race',
    Component: QuickTap,
    modes: ['single', 'multi'],
    art: (
      <span className="tile-art tap-art">
        <i style={{ background: '#ff8c1a' }} />
        <i className="spark">⭐</i>
        <i style={{ background: '#7ec8f2' }} />
      </span>
    ),
  },
  {
    key: 'count',
    label: 'Counting game',
    Component: CountGame,
    modes: ['single', 'multi'],
    art: (
      <span className="tile-art count-art">
        <span className="numeral">3</span>
        <span className="beads">
          <i />
          <i />
          <i />
        </span>
      </span>
    ),
  },
  {
    key: 'sort',
    label: 'Sorting game',
    Component: DragSort,
    modes: ['single', 'multi'],
    art: (
      <span className="tile-art sort-art">
        <i className="drop" style={{ background: '#2fb457' }} />
        <span className="pots">
          <i style={{ background: '#e63946' }} />
          <i style={{ background: '#ffd60a' }} />
          <i style={{ background: '#2fb457' }} />
          <i style={{ background: '#1d75d6' }} />
        </span>
      </span>
    ),
  },
  {
    key: 'sum',
    label: 'Adding game',
    Component: SumGame,
    modes: ['single', 'multi'],
    art: (
      <span className="tile-art sum-art">
        <span className="numeral">+</span>
        <span className="beads">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
    ),
  },
  {
    key: 'sudoku',
    label: 'Sudoku',
    Component: SudokuGame,
    modes: ['single'],
    art: (
      <span className="tile-art sudoku-art">
        <i>5</i>
        <i />
        <i>3</i>
        <i />
        <i>7</i>
        <i />
        <i>9</i>
        <i />
        <i />
      </span>
    ),
  },
]

export default function App() {
  const [players, setPlayers] = useState(null)
  const [gameKey, setGameKey] = useState(null)

  if (!players) {
    return (
      <div className="app home mode-pick">
        <button className="tile mode-tile" onClick={() => setPlayers(1)} aria-label="Play alone">
          <span className="tile-art mode-art">🧒</span>
        </button>
        <button
          className="tile mode-tile"
          onClick={() => setPlayers(2)}
          aria-label="Play with a friend"
        >
          <span className="tile-art mode-art">🧒🧒</span>
        </button>
      </div>
    )
  }

  const game = GAMES.find((g) => g.key === gameKey)
  const mode = players === 1 ? 'single' : 'multi'

  if (!game) {
    return (
      <div className="app home">
        <button className="back" onClick={() => setPlayers(null)} aria-label="Change players">
          ←
        </button>
        {GAMES.filter((g) => g.modes.includes(mode)).map(({ key, label, art }) => (
          <button key={key} className="tile" onClick={() => setGameKey(key)} aria-label={label}>
            {art}
          </button>
        ))}
      </div>
    )
  }

  const Game = game.Component

  return (
    <div className="app">
      <button className="back" onClick={() => setGameKey(null)} aria-label="Back to the games">
        ←
      </button>
      <Game players={players} />
    </div>
  )
}
