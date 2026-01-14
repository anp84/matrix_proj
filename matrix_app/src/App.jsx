import { useMemo, useState, useRef } from 'react'
import './App.scss'
import { MatrixSearcher } from './MatrixSearcher'

// Допустимые шестнадцатеричные символы
const HEX_CHARS = '0123456789ABCDEF';

/**
 * Генерирует случайный шестнадцатеричный символ
 * @returns {string} Случайный символ из диапазона 0-F
 */
const generateHexChar = () =>
  HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]

/**
 * Генерирует матрицу случайных шестнадцатеричных символов
 * @param {number} rows - Количество строк
 * @param {number} cols - Количество столбцов
 * @returns {string[][]} Двумерный массив шестнадцатеричных символов
 */
const generateMatrix = (rows, cols) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => generateHexChar()),
  )

function App() {
  // Размеры матрицы (строки и столбцы) — изначально пустые поля
  const rowsValueRef = useRef('');
  const colsValueRef = useRef('');

  // Матрица по умолчанию не сгенерирована
  const [disabled, setDisabled] = useState(true);

  // Матрица по умолчанию не сгенерирована
  const [matrix, setMatrix] = useState([]);

  // Сохраняем размеры сгенерированной матрицы для отображения
  const [matrixRows, setMatrixRows] = useState(0);
  const [matrixCols, setMatrixCols] = useState(0);

  // Подматрица 2x2 — изначально пустые поля
  const [pattern, setPattern] = useState(['', '', '', '']);

  // Совпадения — изначально отсутствуют
  const [matches, setMatches] = useState([]);

  const highlightedCells = useMemo(() => {
    const set = new Set();
    matches.forEach(({ topLeft, topRight, bottomLeft, bottomRight }) => {
      [topLeft, topRight, bottomLeft, bottomRight].forEach(({ x, y }) =>
        set.add(`${y - 1}-${x - 1}`),
      )
    })
    return set;
  }, [matches])

  /**
   * Обработчик генерации матрицы
   * Создает новую матрицу случайных шестнадцатеричных символов заданного размера
   */
  const handleGenerate = () => {
    const parsedRows = rowsValueRef.current;
    const parsedCols = colsValueRef.current;

    const safeRows = ( Math.min(30, +parsedRows) < 30 && Math.max(1, +parsedRows) > 1 ) ? +parsedRows : -1;
    const safeCols = ( Math.min(30, +parsedCols) < 30 && Math.max(1, +parsedCols) > 1 ) ? +parsedCols : -1;

    // размеры матрицы должны быть не меньше 2x2 (размер подматрицы)
    if (safeRows < 0 || safeCols < 0) {
      window.alert('Размер матрицы должен быть не меньше 2x2 и не больше 30x30');
      return;
    }

    // Генерируем новую матрицу и очищаем предыдущие совпадения
    setMatrix(generateMatrix(safeRows, safeCols));
    // Сохраняем размеры матрицы для отображения (не зависят от полей ввода)
    setMatrixRows(safeRows);
    setMatrixCols(safeCols);
    setMatches([]);
  }

  /**
   * Обработчик изменения значений в полях ввода размеров матрицы
   * @param {Event} event - Событие изменения поля ввода
   * @param {string} inputType - Тип поля: 'rows' (строки) или 'cols' (столбцы)
   */
  const handleInputsChange = (event, inputType) => {
    const { value } = event.target;
    inputType === 'cols' ? colsValueRef.current = value : rowsValueRef.current = value;

    isGenerateEnabled();
  };

  /**
   * Обработчик изменения значения в поле подматрицы
   * Разрешает ввод только шестнадцатеричных символов (0-9, A-F)
   * @param {number} index - Индекс поля в массиве подматрицы (0-3)
   * @returns {Function} Функция-обработчик события изменения
   */
  const handlePatternChange = (index) => (event) => {
    const value = event.target.value.toUpperCase().slice(0, 1);
    if (value === '' || HEX_CHARS.includes(value)) {
      setPattern((prev) => {
        const next = [...prev]
        next[index] = value;
        return next;
      })
    }
  }

  /**
   * Обработчик поиска подматрицы в основной матрице
   * Ищет все вхождения подматрицы 2x2 и сохраняет их координаты
   */
  const handleFind = () => {
    //матрица должна быть сгенерирована
    if (!matrix.length || !matrix[0]?.length) {
      window.alert('Сначала сгенерируйте матрицу.');
      return;
    }

    // Ищем все совпадения подматрицы 2x2 в основной матрице
    setMatches(MatrixSearcher.findSubMatrices2x2(matrix, pattern));
  }

  /**
   * Проверяет, должна ли быть активна кнопка "Сгенерировать"
   */
  const isGenerateEnabled = () => {
    const parsedRows = rowsValueRef.current;
    const parsedCols = colsValueRef.current;
    // Кнопка активна, если оба поля имеют значение (не пустые) и >= 2
    const isEnabled = parsedRows.length && parsedCols.length && +parsedRows >= 2 && +parsedCols >= 2;
    // Обновляем состояние только если оно изменилось, чтобы минимизировать перерисовки
    setDisabled((prevDisabled) => {
      const newDisabled = !isEnabled;
      // Если состояние не изменилось, возвращаем предыдущее значение (не вызываем перерисовку)
      return prevDisabled === newDisabled ? prevDisabled : newDisabled;
    });
  }

  /**
   * Проверяет, должна ли быть активна кнопка "Найти"
   */
  const isFindEnabled = useMemo(() =>
      // Матрица должна быть сгенерирована
      matrix.length > 0 &&
      matrix[0]?.length > 0 &&
      // Все поля подматрицы должны быть заполнены шестнадцатеричными значениями
      pattern.every(
        (cell) => cell.length === 1 && HEX_CHARS.includes(cell.toUpperCase()),
      ), [matrix, pattern]
  )

  const renderMatrix = () => (
    <div
      className="matrix-grid"
      // Используем сохраненные размеры матрицы, а не значения из полей ввода
      style={{ gridTemplateColumns: `repeat(${matrixCols || 1}, 32px)` }}
    >
      {matrix.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const isHighlighted = highlightedCells.has(`${rowIndex}-${colIndex}`);
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
          <h2>Поиск подматрицы в матрице шестнадцатеричных символов</h2>
          <p className="lede">
            Введите размеры, сгенерируйте матрицу, задайте символы подматрицы, нажмите кнопку "Найти" и
            увидите все совпадения.
          </p>
        </div>
      </header>
      <div className="main-box">
      <section className="matrix-section">
        <div className="matrix-header">
          {/* Отображаем размеры из полей ввода, но матрица использует сохраненные размеры */}
          <h3>Матрица {rowsValueRef.current || matrixRows || ''} x {colsValueRef.current || matrixCols || ''}</h3>
            <div className="legend">
              <span className="legend-color highlight" />
              <span>- найденные вхождения</span>
            </div>
        </div>
        <div className="matrix-frame">{renderMatrix()}</div>
      </section>
      <div>
      <section className="controls">
        <div className="sizes">
          <div className="control-group">
            <label htmlFor="rows">Строки</label>
            <input
              id="rows"
              type="number"
              min={2}
              max={30}
              onChange={(e) => handleInputsChange(e, 'rows')}
            />
          </div>
          <div className="control-group">
            <label htmlFor="cols">Столбцы</label>
            <input
              id="cols"
              type="number"
              min={2}
              max={30}
              onChange={(e) => handleInputsChange(e, 'cols')}
            />
          </div>
          <div></div>
          <button
            className="primary"
            onClick={handleGenerate}
            disabled={disabled}
          >
            Сгенерировать
          </button>
        </div>
        <div className="pattern">
          <span className="pattern-title">Подматрица 2x2</span>
          <div className="pattern-inner">
            <div className="pattern-grid">
              <input
                key={0}
                className="pattern-input"
                type="text"
                maxLength={1}
                value={pattern[0]}
                onChange={handlePatternChange(0)}
                 placeholder="0-F"
              />
              <input
                key={1}
                className="pattern-input"
                type="text"
                maxLength={1}
                value={pattern[1]}
                onChange={handlePatternChange(1)}
                placeholder="0-F"
              />
              <input
                key={2}
                className="pattern-input"
                type="text"
                maxLength={1}
                value={pattern[2]}
                onChange={handlePatternChange(2)}
                placeholder="0-F"
              />
              <input
                key={3}
                className="pattern-input"
                type="text"
                maxLength={1}
                value={pattern[3]}
                onChange={handlePatternChange(3)}
                placeholder="0-F"
              />
            </div>
            <button
              type="button"
              className="primary"
              onClick={handleFind}
              disabled={!isFindEnabled}
            >
              Найти
            </button>
          </div>
        </div>
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
                <div className="matches-list__row">
                  <span>
                    TL({match.topLeft.x}, {match.topLeft.y}), TR(
                    {match.topRight.x}, {match.topRight.y}),
                  </span>
                  <span>
                    BL({match.bottomLeft.x}, {match.bottomLeft.y}), BR(
                    {match.bottomRight.x}, {match.bottomRight.y})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </div>
  </div>
  )
}

export default App
