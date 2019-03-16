module.exports = solveSudoku;

/**
 * Solve sudoku matrix.
 *
 * @param {number[][]} matrix
 *
 * @returns {number[][]}
 */
function solveSudoku(matrix){


  let sudoku = new Sudoku(matrix);

  sudoku.solve()

  if (sudoku.isSolved){
    return sudoku.matrix;
  }

  if (!sudoku.hasSolution){
    return null;
  }

  let cell = sudoku.shortestCanBeCell;
  let canBe = cell.canBe;

  while (canBe.length){

    let newMatrix = sudoku.matrix;
    newMatrix[cell.rowNum][cell.colNum] = cell.canBe[0];

    let res = solveSudoku(newMatrix);

    if (!res){
      canBe.shift();
    } else {
      return res;
    }

  }

  return null;
}

class Sudoku {

  /** Creates an object implementation of the sudoku.
   * @param {number[][]} matrix - Inital matix.
   */
  constructor(matrix){

    // Fill the sudoku cells.
    /** The Sudoku instance have 9 members named from 0 to 8. Every member is an array of the cells.
     * @member {Cell[]} Sudoku#0-8
     */
    matrix.forEach((row, rowNum, matrix) => {
      this[rowNum] = [];

      row.forEach((value, colNum, row) => {
        this[rowNum][colNum] = new Cell(value, rowNum, colNum);
      })
    })

    /** Indicates whether sudoku is solved or not.
     * @member {boolean} Sudoku#isSolved
     */
    this.isSolved = false;

    /** Indicates whether sudoku has solution or not.
     * @member {boolean} Sudoku#hasSolution
     */
    this.hasSolution = true;
  }

  /** Return the number matrix of the sudoku.
   * @readonly
   * @memberof Sudoku
   */
  get matrix(){
    let matrix = [];

    for (let row=0; row<9; row++){
      matrix[row] = [];

      for (let col=0; col<9; col++){
        let value = this[row][col].value;
        matrix[row][col] = (value) ? value : 0;
      }
    }

    return matrix;
  }

  /** Solve sudoku.
   *  The function doesn't use the substitution method to solve the matrix.
   *  Therefore the sudoku may have three states when the method is finished:
   *    - has no solution;
   *    - has solution and is solved;
   *    - has solution but isn't solved.
   * @memberof Sudoku
   */
  solve(){
    let sudoku = this;
    let sudokuIsChanged = true;
    let cellHasNoValue = false;

    while (sudoku.hasSolution && sudokuIsChanged){

      sudokuIsChanged = false;
      cellHasNoValue = false;

      sudoku.forEachCell((cell) => {

        let canBe = cell.canBe;

        if (!cell.value){

          cellHasNoValue = true;

          for (let i=0; i<canBe.length; i++){
            let value = canBe[i];

            let can = sudoku.canValueBeInCell(value, cell);

            if (!can){
              canBe.splice(i, 1);
              i--;
              sudokuIsChanged = true;
            }
          }

          if (canBe.length === 0){
            sudoku.hasSolution = false;
          } else if (canBe.length === 1){
            cell.value = canBe[0];
          }

        }
      });

    }

    if (!cellHasNoValue){
      sudoku.isSolved = true;
    }
  }

  /**
   * Return the sudoku cell thats has the shortest property "canBe".
   *
   * @readonly
   * @memberof Sudoku
   * @return {Cell}
   */
  get shortestCanBeCell(){
    let sudoku = this;
    let minCell = null;

    let row;
    let col;

    Label:
    for (row=0; row<9; row++){
      for (col=0; col<9; col++){

        if (!sudoku[row][col].value){
          minCell = sudoku[row][col];
          break Label;
        }
      }
    }

    if (!minCell) return null;

    for (; row<9; row++){
      for (col=0; col<9; col++){

        if (!sudoku[row][col].value){
          let currentLength = sudoku[row][col].canBe.length;
          let minLength = minCell.canBe.length;

          if (currentLength < minLength){
            minCell = sudoku[row][col];
          }
        }
      }
    }

    return minCell;
  }

  /**
   * Check if the value is allowed as a cell value.
   *
   * @memberof Sudoku
   *
   * @param {number} value
   * @param {Cell} cell
   *
   * @return {boolean}
   */
  canValueBeInCell(value, cell){
    let sudoku = this;

    if (cell.value && cell.value === value){
      return true;
    }

    { // check by row
      let row = cell.rowNum;

      for (let col=0; col<9; col++){
        if (sudoku[row][col].value === value){
          return false;
        }
      }
    }

    { // check by column
      let col = cell.colNum;

      for (let row=0; row<9; row++){
        if (sudoku[row][col].value === value){
          return false;
        }
      }
    }

    { // check by square
      let square = sudoku.getSquareByCell(cell);

      for (let i=0; i<9; i++){
        if (square[i].value === value){
          return false;
        }
      }

    }

    return true;
  }

  /**
   * Return a square that's contain a passed cell.
   *
   * @param {Cell} cell
   *
   * @return {cell[]}
   */
  getSquareByCell(cell){
    let sudoku = this;
    let res = [];

    let rowStart = Math.floor(cell.rowNum / 3) * 3;
    let colStart = Math.floor(cell.colNum / 3) * 3;

    let rowEnd = rowStart + 3;
    let colEnd = colStart + 3;

    for (let row = rowStart; row < rowEnd; row++){
      for (let col = colStart; col < colEnd; col++){
        res.push(sudoku[row][col]);
      }
    }

    return res;
  }

  /**
   * Call a callback function for each cell.
   * @param {function} callback
   */
  forEachCell(callback){
    let sudoku = this;

    for (let row=0; row<9; row++){
      for (let col=0; col<9; col++){
        callback(sudoku[row][col]);
      }
    }
  }

  /** @callback ForEachCellCallback
   * @param cell
   */
}


class Cell {

  /**
   * Creates an object implementation of the sudoku cell.
   * @param {number} value - Value of the cell. If the value equal to 0, the cell is empty.
   */
  constructor(value, rowNum, colNum){

    /**
     * Value of the cell.
     *
     * @member {number|null} Cell#value
     *
     * @memberof Cell
     */
    this.value = null;

    /**
     * The array of the allowed values of this cell.
     * It is null if the cell value is set.
     *
     * @member {number[]|null} Cell#canBe
     */
    this.canBe = null;

    /**
     * The index of cell row
     *
     * @member {number} Cell#rowNum
     */
    this.rowNum = rowNum;

    /**
     * The index of cell column
     *
     * @member {number} Cell#colNum
     */
    this.colNum = colNum;

    if (value){
      this.value = value;
    } else {
      this.canBe = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
  }
}