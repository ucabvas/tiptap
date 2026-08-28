import { useState } from 'react'
import MixGame from './MixGame'
import MemoryGame from './MemoryGame'
import ThreeInARow from './ThreeInARow'
import QuickTap from './QuickTap'
import CountGame from './CountGame'
import './App.css'

const GAMES = {
  mix: MixGame,
  memory: MemoryGame,
  row: ThreeInARow,
  tap: QuickTap,
  count: CountGame,
}

export default function App() {
  const [game, setGame] = useState(null)
  const Game = GAMES[game]

  if (!Game) {
    return (
      <div className="app home">
        <button className="tile" onClick={() => setGame('mix')} aria-label="Mixing colors">
          <span className="tile-art mix-art">
            <i style={{ background: '#ffd60a' }} />
            <i style={{ background: '#1d75d6' }} />
          </span>
        </button>

        <button className="tile" onClick={() => setGame('memory')} aria-label="Matching pairs">
          <span className="tile-art memory-art">
            <i style={{ background: '#e63946' }} />
            <i style={{ background: '#2fb457' }} />
            <i style={{ background: '#2fb457' }} />
            <i style={{ background: '#e63946' }} />
          </span>
        </button>

        <button className="tile" onClick={() => setGame('row')} aria-label="Three in a row">
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
        </button>

        <button className="tile" onClick={() => setGame('tap')} aria-label="Quick tap race">
          <span className="tile-art tap-art">
            <i style={{ background: '#ff8c1a' }} />
            <i className="spark">⭐</i>
            <i style={{ background: '#7ec8f2' }} />
          </span>
        </button>

        <button className="tile" onClick={() => setGame('count')} aria-label="Counting game">
          <span className="tile-art count-art">
            <span className="numeral">3</span>
            <span className="beads">
              <i />
              <i />
              <i />
            </span>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <button className="back" onClick={() => setGame(null)} aria-label="Back to the games">
        ←
      </button>
      <Game />
    </div>
  )
}
