const HEX_CHARS = '0123456789ABCDEF'

export class MatrixSearcher {
  /**
   * Поиск всех вхождений подматрицы 2x2 в матрице шестнадцатеричных символов.
   *
   * @param {string[][]} matrix - основная матрица
   * @param {string[]} pattern - подматрица в виде плоского массива
   * @param {number} patternRows - количество строк подматрицы (2)
   * @param {number} patternCols - количество столбцов подматрицы (2)
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
        let isMatch = MatrixSearcher.#getMatches(matrix, pattern, row, col, patternRows, patternCols);

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
   * Проверка на совпадение всех элементов подматрицы с основной матрицей
   * @param {string[][]} matrix - основная матрица
   * @param {string[]} pattern - подматрица в виде плоского массива
   * @param {number} row - начальная строка в матрице
   * @param {number} col - начальный столбец в матрице
   * @param {number} patternRows - строки подматрицы
   * @param {number} patternCols - колонки подматрицы
   * @returns {boolean} true если совпадение найдено
   */ 
  static #getMatches(matrix, pattern, row, col, patternRows, patternCols){
    // Проверяем все элементы подматрицы
    for (let pr = 0; pr < patternRows; pr += 1) {
      for (let pc = 0; pc < patternCols; pc += 1) {
        const patternIndex = pr * patternCols + pc
        if (matrix[row + pr][col + pc] !== pattern[patternIndex]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * @param {string[][]} matrix - основная матрица
   * @param {string[]} pattern - подматрица 2x2 в виде массива из 4 символов [p00, p01, p10, p11]
   * @returns {Array} массив совпадений с координатами вершин
   */
  static findSubMatrices2x2(matrix, pattern) {
    return MatrixSearcher.findSubMatrices(matrix, pattern, 2, 2)
  }
}


