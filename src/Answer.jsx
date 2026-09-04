// The answering half of the number games: pick a card, or type the number.
export function NumberCards({ options, answer, wrong, solved, color, onGuess }) {
  return (
    <div className="choices">
      {options.map((option) => (
        <button
          key={option}
          className={`choice ${wrong.includes(option) ? 'nope' : ''} ${
            solved && option === answer ? 'yes' : ''
          }`}
          style={{ '--player-color': color }}
          aria-label={`${option}`}
          disabled={solved}
          onClick={() => onGuess(option)}
        >
          <span className="numeral">{option}</span>
          <span className="beads">
            {Array.from({ length: option }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </button>
      ))}
    </div>
  )
}

export function TypeBox({ answer, typed, solved, color }) {
  return (
    <div
      className={`typed ${solved ? 'yes' : ''} ${typed ? 'nope' : ''}`}
      style={{ '--player-color': color }}
      aria-label="type the number"
    >
      <span className="numeral">
        {solved ? answer : typed || <i className="caret" />}
      </span>
    </div>
  )
}

export function LevelButton({ level, onSelect }) {
  return (
    <div className="level-toggle">
      <button
        className={level === 1 ? 'active' : ''}
        onClick={() => onSelect(1)}
        aria-label="pick the number"
      >
        🔢
      </button>
      <button
        className={level === 2 ? 'active' : ''}
        onClick={() => onSelect(2)}
        aria-label="type the number"
      >
        ⌨️
      </button>
    </div>
  )
}

// Digits typed on the keyboard, for level two.
export function typedDigit(event) {
  if (!event.key.match(/^[1-9]$/)) return null
  event.preventDefault()
  return Number(event.key)
}
