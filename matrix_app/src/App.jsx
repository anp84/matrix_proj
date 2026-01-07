import { useMemo, useState } from 'react'
import './App.css'

const HEX_CHARS = '0123456789ABCDEF'

const generateHexChar = () => HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]

const generateMatrix = (rows, cols) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => generateHexChar()),
  )

const findSubMatrices2x2 = (matrix, pattern) => {
  if (!matrix.length || pattern.some((cell) => cell.length !== 1)) return []

  const [p00, p01, p10, p11] = pattern
  const matches = []

  for (let row = 0; row < matrix.length - 1; row += 1) {
    for (let col = 0; col < matrix[0].length - 1; col += 1) {
      if (
        matrix[row][col] === p00 &&
        matrix[row][col + 1] === p01 &&
        matrix[row + 1][col] === p10 &&
        matrix[row + 1][col + 1] === p11
      ) {
        matches.push({
          topLeft: { x: col + 1, y: row + 1 },
          topRight: { x: col + 2, y: row + 1 },
          bottomLeft: { x: col + 1, y: row + 2 },
          bottomRight: { x: col + 2, y: row + 2 },
        })
      }
    }
  }

  return matches
}

function App() {
  // Размеры матрицы (строки и столбцы) — изначально пустые поля
  const [rows, setRows] = useState('')
  const [cols, setCols] = useState('')

  // Матрица по умолчанию не сгенерирована
  const [matrix, setMatrix] = useState([])

  // Подматрица 2x2 — изначально пустые поля
  const [pattern, setPattern] = useState(['', '', '', ''])

  // Совпадения — изначально отсутствуют
  const [matches, setMatches] = useState([])

  const highlightedCells = useMemo(() => {
    const set = new Set()
    matches.forEach(({ topLeft, topRight, bottomLeft, bottomRight }) => {
      ;[topLeft, topRight, bottomLeft, bottomRight].forEach(({ x, y }) =>
        set.add(`${y - 1}-${x - 1}`),
      )
    })
    return set
  }, [matches])

  const handleGenerate = () => {
    const parsedRows = parseInt(rows, 10)
    const parsedCols = parseInt(cols, 10)

    const safeRows = Math.max(2, Math.min(30, parsedRows))
    const safeCols = Math.max(2, Math.min(30, parsedCols))

    setMatrix(generateMatrix(safeRows, safeCols))
    setMatches([])
  }

  const handleSizeChange = (setter) => (event) => {
    const { value } = event.target
    // Разрешаем пустое значение, чтобы поле можно было очистить
    if (value === '') {
      setter('')
      return
    }

    const numeric = parseInt(value, 10)
    if (Number.isNaN(numeric) || numeric <= 0) {
      // Игнорируем некорректный ввод (не положительное целое)
      return
    }

    const clamped = Math.max(1, Math.min(30, numeric))
    setter(String(clamped))
  }

  const handlePatternChange = (index) => (event) => {
    const value = event.target.value.toUpperCase().slice(0, 1)
    if (value === '' || HEX_CHARS.includes(value)) {
      setPattern((prev) => {
        const next = [...prev]
        next[index] = value
        return next
      })
    }
  }

  const handleFind = () => {
    // Проверка: матрица должна быть сгенерирована
    if (!matrix.length || !matrix[0]?.length) {
      window.alert('Сначала сгенерируйте матрицу.')
      return
    }

    // Проверка: размеры матрицы должны быть не меньше 2x2 (размер подматрицы)
    const matrixRows = matrix.length
    const matrixCols = matrix[0].length
    if (matrixRows < 2 || matrixCols < 2) {
      window.alert('Размер матрицы должен быть не меньше 2x2.')
      return
    }

    setMatches(findSubMatrices2x2(matrix, pattern))
  }

  const isGenerateEnabled = useMemo(() => {
    const parsedRows = parseInt(rows, 10)
    const parsedCols = parseInt(cols, 10)
    return (
      Number.isInteger(parsedRows) &&
      Number.isInteger(parsedCols) &&
      parsedRows > 0 &&
      parsedCols > 0
    )
  }, [rows, cols])

  const isFindEnabled = useMemo(
    () =>
      pattern.every(
        (cell) => cell.length === 1 && HEX_CHARS.includes(cell.toUpperCase()),
      ),
    [pattern],
  )

  const renderMatrix = () => (
    <div
      className="matrix-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 36px)` }}
    >
      {matrix.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const isHighlighted = highlightedCells.has(`${rowIndex}-${colIndex}`)
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${isHighlighted ? 'highlight' : ''}`}
            >
              {value}
            </div>
          )
        }),
      )}
    </div>
  )

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Определение вхождения подматрицы 2x2</p>
          <h1>Поиск подматрицы в матрице шестнадцатеричных символов</h1>
          <p className="lede">
            Введите размеры, сгенерируйте матрицу, задайте символы подматрицы, нажмите кнопку "Найти" и
            увидите все совпадения.
          </p>
        </div>
      </header>

      <section className="controls">
        <div className="sizes">
          <div className="control-group">
            <label htmlFor="rows">Строки</label>
            <input
              id="rows"
              type="number"
              min={2}
              max={30}
              value={rows}
              onChange={handleSizeChange(setRows)}
            />
          </div>
          <div className="control-group">
            <label htmlFor="cols">Столбцы</label>
            <input
              id="cols"
              type="number"
              min={2}
              max={30}
              value={cols}
              onChange={handleSizeChange(setCols)}
            />
          </div>
          <button
            className="primary full"
            onClick={handleGenerate}
            disabled={!isGenerateEnabled}
          >
            Сгенерировать
          </button>
        </div>
        <div className="pattern">
          <span className="pattern-title">Подматрица 2x2</span>
          <div className="pattern-inner">
            <div className="pattern-grid">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  className="pattern-input"
                  type="text"
                  maxLength={1}
                  value={pattern[index]}
                  onChange={handlePatternChange(index)}
                  placeholder="0-F"
                />
              ))}
            </div>
            <button
              type="button"
              className="secondary"
              onClick={handleFind}
              disabled={!isFindEnabled}
            >
              Найти
            </button>
          </div>
        </div>
      </section>

      <section className="matrix-section">
        <div className="matrix-header">
          <h2>Матрица {rows} x {cols}</h2>
          <div className="legend">
            <span className="legend-color highlight" />
            <span>— найденные вхождения</span>
          </div>
        </div>
        <div className="matrix-frame">{renderMatrix()}</div>
      </section>

      <section className="results">
        <h3>Найдено совпадений: {matches.length}</h3>
        {matches.length === 0 ? (
          <p className="muted">Совпадений нет. Попробуйте другие символы.</p>
        ) : (
          <ul className="matches-list">
            {matches.map((match, index) => (
              <li key={`${match.topLeft.x}-${match.topLeft.y}-${index}`}>
                <span className="badge">#{index + 1}</span>
                <span>
                  TL({match.topLeft.x}, {match.topLeft.y}) • TR(
                  {match.topRight.x}, {match.topRight.y}) • BL(
                  {match.bottomLeft.x}, {match.bottomLeft.y}) • BR(
                  {match.bottomRight.x}, {match.bottomRight.y})
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
