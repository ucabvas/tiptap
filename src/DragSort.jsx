import { useEffect, useRef, useState } from 'react'
import { COLORS } from './colors'
import { PlayerBar, PlayerPicker, SEATS, usePlayers } from './Players'
import './DragSort.css'

const BUCKETS = ['red', 'yellow', 'green', 'blue']

const TARGET = 5

// Blobs start slow and speed up as the match goes on.
const START_TIME = 2200
const MIN_TIME = 900
const TIME_STEP = 140

const hexOf = (id) => COLORS.find((c) => c.id === id).hex

const newBlob = () => ({
  id: Math.random(),
  colorId: BUCKETS[Math.floor(Math.random() * BUCKETS.length)],
})

export default function DragSort({ players }) {
  const { faces, picking, setPicking, choose } = usePlayers(players)
  const [blob, setBlob] = useState(newBlob)
  const [drag, setDrag] = useState(null)
  const [landed, setLanded] = useState(null)
  const [expired, setExpired] = useState(false)
  const [bumped, setBumped] = useState(null)
  const [missed, setMissed] = useState(false)
  const [scores, setScores] = useState(() => Array(players).fill(0))
  const [turn, setTurn] = useState(0)
  const bucketRefs = useRef([])

  const matchOver = scores.some((score) => score === TARGET)
  const caught = scores.reduce((sum, n) => sum + n, 0)
  const timeLimit = Math.max(MIN_TIME, START_TIME - caught * TIME_STEP)
  const over = landed !== null || expired

  // A blob that isn't caught in time slips away -- no point, next player's go.
  useEffect(() => {
    if (over || matchOver) return
    const timer = setTimeout(() => {
      setExpired(true)
      setDrag(null)
    }, timeLimit)
    return () => clearTimeout(timer)
  }, [blob, over, matchOver, timeLimit])

  // Once a blob is caught or missed, the next one comes right out.
  useEffect(() => {
    if (!over) return
    const timer = setTimeout(
      () => {
        setLanded(null)
        setExpired(false)
        setMissed(false)
        setBlob(newBlob())
        setTurn((prev) => (prev + 1) % players)
      },
      landed !== null ? 700 : 500
    )
    return () => clearTimeout(timer)
  }, [over, landed, players])

  useEffect(() => {
    if (bumped === null) return
    const timer = setTimeout(() => setBumped(null), 400)
    return () => clearTimeout(timer)
  }, [bumped])

  const start = (event) => {
    if (over || matchOver) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ sx: event.clientX, sy: event.clientY, x: event.clientX, y: event.clientY })
  }

  const move = (event) => {
    if (!drag) return
    setDrag((prev) => ({ ...prev, x: event.clientX, y: event.clientY }))
  }

  const drop = (event) => {
    if (!drag || expired) return
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
    setScores(Array(players).fill(0))
    setTurn(0)
    setMissed(false)
    setLanded(null)
    setExpired(false)
    setDrag(null)
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
        winners={scores.map((score) => matchOver && score === TARGET)}
        piles={scores.map((n, i) =>
          Array.from({ length: n }, (_, j) => ({ key: j, color: SEATS[i].color }))
        )}
        onPick={setPicking}
      />

      {!matchOver && (
        <div className="timer-track">
          <div
            key={blob.id}
            className="timer-bar"
            style={{ animationDuration: `${timeLimit}ms` }}
          />
        </div>
      )}

      <div className="blob-shelf">
        {landed === null && (
          <button
            className={`blob ${drag ? 'held' : ''} ${expired ? 'expired' : ''}`}
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
