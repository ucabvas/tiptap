import { useState } from 'react'
import './Players.css'

export const FACES = ['🦊', '🐼', '🐸', '🦁', '🐵', '🐷', '🐙', '🦄', '🐨', '🐝']

export const SEATS = [{ color: '#ff8c1a' }, { color: '#7ec8f2' }]

// Both games start the same way: two players, each picking an animal.
export function usePlayers() {
  const [faces, setFaces] = useState([null, null])
  const [picking, setPicking] = useState(0)

  const choose = (face) => {
    setFaces((prev) => prev.map((f, i) => (i === picking ? face : f)))
    setPicking(picking === 0 && !faces[1] ? 1 : null)
  }

  return { faces, picking, setPicking, choose }
}

export function PlayerPicker({ faces, picking, onChoose }) {
  return (
    <>
      <div className="seats">
        {SEATS.map((seat, i) => (
          <span
            key={i}
            className={`seat ${picking === i ? 'choosing' : ''}`}
            style={{ '--player-color': seat.color }}
          >
            {faces[i] || ''}
          </span>
        ))}
      </div>

      <div className="faces">
        {FACES.filter((face) => !faces.includes(face) || faces[picking] === face).map(
          (face) => (
            <button
              key={face}
              className="face-pick"
              aria-label={`choose ${face}`}
              onClick={() => onChoose(face)}
            >
              {face}
            </button>
          )
        )}
      </div>
    </>
  )
}

// The animals and their winnings, sitting above the board.
export function PlayerBar({ faces, turn, over, winners, piles, onPick }) {
  return (
    <div className="players">
      {SEATS.map((seat, i) => (
        <button
          key={i}
          className={`player ${!over && turn === i ? 'active' : ''} ${
            winners[i] ? 'winner' : ''
          }`}
          style={{ '--player-color': seat.color }}
          aria-label={`player ${i + 1}, change animal`}
          onClick={() => onPick(i)}
        >
          <span className="face">{faces[i]}</span>
          <span className="pile">
            {piles[i].map((token) =>
              token.face ? (
                <span key={token.key} className="pile-face">
                  {token.face}
                </span>
              ) : (
                <i
                  key={token.key}
                  className={token.pale ? 'star-dot' : ''}
                  style={{ background: token.color }}
                />
              )
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
