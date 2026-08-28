import { useEffect, useRef, useState } from 'react'
import { COLORS } from './colors'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './DragSort.css'

const BUCKETS = ['red', 'yellow', 'green', 'blue']

const TARGET = 5

const hexOf = (id) => COLORS.find((c) => c.id === id).hex

const newBlob = () => ({
  id: Math.random(),
  colorId: BUCKETS[Math.floor(Math.random() * BUCKETS.length)],
})

export default function DragSort() {
  const { faces, picking, setPicking, choose } = usePlayers()
  const [blob, setBlob] = useState(newBlob)
  const [drag, setDrag] = useState(null)
  const [landed, setLanded] = useState(null)
  const [bumped, setBumped] = useState(null)
  const [missed, setMissed] = useState(false)
  const [scores, setScores] = useState([0, 0])
  const [turn, setTurn] = useState(0)
  const bucketRefs = useRef([])

  const matchOver = scores.some((score) => score === TARGET)

  // Once a blob is home, the next one comes out and the other player has a go.
  useEffect(() => {
    if (landed === null) return
    const timer = setTimeout(() => {
      setLanded(null)
      setMissed(false)
      setBlob(newBlob())
      setTurn((prev) => 1 - prev)
    }, 900)
    return () => clearTimeout(timer)
  }, [landed])

  useEffect(() => {
    if (bumped === null) return
    const timer = setTimeout(() => setBumped(null), 400)
    return () => clearTimeout(timer)
  }, [bumped])

  const start = (event) => {
    if (landed !== null || matchOver) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ sx: event.clientX, sy: event.clientY, x: event.clientX, y: event.clientY })
  }

  const move = (event) => {
    if (!drag) return
    setDrag((prev) => ({ ...prev, x: event.clientX, y: event.clientY }))
  }

  const drop = (event) => {
    if (!drag) return
    setDrag(null)
    const index = bucketRefs.current.findIndex((node) => {
      if (!node) return false
      const box = node.getBoundingClientRect()
      return (
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom
      )
    })
    // Dropped in mid-air: no harm done, the blob just goes home.
    if (index === -1) return
    if (BUCKETS[index] !== blob.colorId) {
      setBumped(index)
      setMissed(true)
      return
    }
    if (!missed) {
      setScores((prev) => prev.map((n, i) => (i === turn ? n + 1 : n)))
    }
    setLanded(index)
  }

  const restart = () => {
    setScores([0, 0])
    setTurn(0)
    setMissed(false)
    setLanded(null)
    setBlob(newBlob())
  }

  if (picking !== null) {
    return (
      <div className="game sort-game">
        <PlayerPicker faces={faces} picking={picking} onChoose={choose} />
      </div>
    )
  }

  return (
    <div className="game sort-game">
      <PlayerBar
        faces={faces}
        turn={turn}
        over={matchOver}
        winners={SEATS.map((_, i) => matchOver && scores[i] === TARGET)}
        piles={scores.map((n, i) =>
          Array.from({ length: n }, (_, j) => ({ key: j, color: SEATS[i].color }))
        )}
        onPick={setPicking}
      />

      <div className="blob-shelf">
        {landed === null && (
          <button
            className={`blob ${drag ? 'held' : ''}`}
            style={{
              background: hexOf(blob.colorId),
              transform: drag
                ? `translate(${drag.x - drag.sx}px, ${drag.y - drag.sy}px)`
                : undefined,
            }}
            aria-label={`drag the ${blob.colorId} blob`}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={drop}
            onPointerCancel={() => setDrag(null)}
          />
        )}
      </div>

      <div className="buckets">
        {BUCKETS.map((colorId, index) => (
          <div
            key={colorId}
            ref={(node) => (bucketRefs.current[index] = node)}
            className={`bucket ${landed === index ? 'full' : ''} ${
              bumped === index ? 'bump' : ''
            }`}
            style={{ '--bucket-color': hexOf(colorId) }}
          >
            {landed === index && <span className="catch" />}
          </div>
        ))}
      </div>

      <button className="reset" onClick={restart} aria-label="Start over">
        ↺
      </button>
    </div>
  )
}
