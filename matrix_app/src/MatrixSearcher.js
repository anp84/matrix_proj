const HEX_CHARS = '0123456789ABCDEF'

export class MatrixSearcher {
  /**
   * Поиск всех вхождений подматрицы MxN (по умолчанию 2x2)
   * в матрице шестнадцатеричных символов.
   *
   * @param {string[][]} matrix - основная матрица
   * @param {string[]} pattern - подматрица в виде плоского массива длиной M * N
   * @param {number} patternRows - количество строк подматрицы (M)
   * @param {number} patternCols - количество столбцов подматрицы (N)
   * @returns {Array} массив совпадений с координатами вершин
   */
  static findSubMatrices(matrix, pattern, patternRows = 2, patternCols = 2) {
    if (
      !Array.isArray(matrix) ||
      matrix.length === 0 ||
      !Array.isArray(matrix[0]) ||
      !Array.isArray(pattern)
    ) {
      return []
    }

    // Валидация размеров и содержимого подматрицы
    if (
      pattern.length !== patternRows * patternCols ||
      patternRows <= 0 ||
      patternCols <= 0
    ) {
      return []
    }

    // Каждый элемент — ровно один шестнадцатеричный символ
    if (
      pattern.some(
        (cell) =>
          typeof cell !== 'string' ||
          cell.length !== 1 ||
          !HEX_CHARS.includes(cell.toUpperCase()),
      )
    ) {
      return []
    }

    const rows = matrix.length
    const cols = matrix[0].length

    // Если подматрица больше исходной матрицы — совпадений быть не может
    if (rows < patternRows || cols < patternCols) {
      return []
    }

    const matches = []

    const maxRowStart = rows - patternRows
    const maxColStart = cols - patternCols

    for (let row = 0; row <= maxRowStart; row += 1) {
      for (let col = 0; col <= maxColStart; col += 1) {
        let isMatch = true

        // Проверяем все элементы подматрицы
        outer: for (let pr = 0; pr < patternRows; pr += 1) {
          for (let pc = 0; pc < patternCols; pc += 1) {
            const patternIndex = pr * patternCols + pc
            if (matrix[row + pr][col + pc] !== pattern[patternIndex]) {
              isMatch = false
              break outer
            }
          }
        }

        if (isMatch) {
          matches.push({
            topLeft: { x: col + 1, y: row + 1 },
            topRight: { x: col + patternCols, y: row + 1 },
            bottomLeft: { x: col + 1, y: row + patternRows },
            bottomRight: { x: col + patternCols, y: row + patternRows },
          })
        }
      }
    }

    return matches
  }

  /**
   * Обёртка для поиска строго подматрицы 2x2 (для совместимости с текущим UI).
   *
   * @param {string[][]} matrix - основная матрица
   * @param {string[]} pattern - подматрица 2x2 в виде массива из 4 символов [p00, p01, p10, p11]
   * @returns {Array} массив совпадений с координатами вершин
   */
  static findSubMatrices2x2(matrix, pattern) {
    return MatrixSearcher.findSubMatrices(matrix, pattern, 2, 2)
  }
}


