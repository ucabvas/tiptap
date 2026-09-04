import { useState } from 'react'
import MixGame from './MixGame'
import MemoryGame from './MemoryGame'
import ThreeInARow from './ThreeInARow'
import QuickTap from './QuickTap'
import CountGame from './CountGame'
import DragSort from './DragSort'
import SumGame from './SumGame'
import './App.css'

const GAMES = [
  {
    key: 'mix',
    label: 'Mixing colors',
    Component: MixGame,
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
    art: (
      <span className="tile-art sort-art">
        <i className="drop" style={{ background: '#2fb457' }} />
        <i className="pot" style={{ background: '#2fb457' }} />
      </span>
    ),
  },
  {
    key: 'sum',
    label: 'Adding game',
    Component: SumGame,
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

  if (!game) {
    return (
      <div className="app home">
        <button className="back" onClick={() => setPlayers(null)} aria-label="Change players">
          ←
        </button>
        {GAMES.map(({ key, label, art }) => (
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
