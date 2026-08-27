import { useState } from 'react'
import { COLORS, colorById, mix } from './colors'
import './MixGame.css'

export default function MixGame() {
  const [picks, setPicks] = useState([])

  const pick = (id) => {
    setPicks((prev) => (prev.length === 2 ? [id] : [...prev, id]))
  }

  const [a, b] = picks
  const result = a && b ? mix(a, b) : null

  return (
    <div className="game mix-game">
      <div className="equation">
        <Slot id={a} />
        <span className="sign">+</span>
        <Slot id={b} />
        <span className="sign">=</span>
        <div
          className={`slot result ${result ? 'pop' : ''}`}
          key={result ? result.hex : 'empty'}
          style={result ? { background: result.hex } : undefined}
        />
      </div>

      <p className="answer">{result ? result.name : ' '}</p>

      <div className="palette">
        {COLORS.map((c) => (
          <button
            key={c.id}
            className="chip"
            aria-label={c.name}
            onClick={() => pick(c.id)}
          >
            <span className="swatch" style={{ background: c.hex }} />
            <span className="chip-name">{c.name}</span>
          </button>
        ))}
      </div>

      <button className="reset" onClick={() => setPicks([])} aria-label="Start over">
        ↺
      </button>
    </div>
  )
}

function Slot({ id }) {
  const color = id ? colorById(id) : null
  return (
    <div
      className="slot"
      style={color ? { background: color.hex } : undefined}
    />
  )
}
