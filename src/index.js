module.exports = function solveSudoku(matrix) {
  let sudoku = createSudoku();
  let resultGrid;
  let sCopy;

  do {
    sCopy = JSON.parse(JSON.stringify(sudoku));
    for (let row = 0; row < sudoku.length; row++) {
      for (let column = 0; column < sudoku[row].length; column++) {
        let sudokuRow = sudoku[row];
        if (sudokuRow[column].status) {
          continue;
        }
        solve(row, column, getSquare(row, column));
        if (sudokuRow[column].status) {
          continue;
        }
        solve(row, column, getRow(row, column));
        if (sudokuRow[column].status) {
          continue;
        }
        solve(row, column, getColumn(row, column));
        if (sudokuRow[column].status) {
          continue;
        }
      }
    }
    if (!isSolved() && !isDiff(sCopy)) {
      for (let row = 0; row < sudoku.length; row++) {
        for (let column = 0; column < sudoku[row].length; column++) {
          let sudokuRow = sudoku[row];
          if (sudokuRow[column].status) {
            continue;
          } else {
            setUnic(row, column, getSquare(row, column));
          }
        }
      }
    }
  } while (!isSolved() && isDiff(sCopy))

  if (!isSolved()) {
    backTrackingSolve(0, 0);
  }

  if (isSolved()) {
    resultGrid = sudoku.map(row => row.map(cell => cell.value));
  } else {
    throw new Error("Cannot solve sudoku");
  }

  return resultGrid;

  function backTrackingSolve(row, column) {
    let location = findEmtyCell(row, column);
    if (location == "end!") {
      return true;
    } else {
      row = location.row;
      column = location.column;
    }

    let values = sudoku[location.row][location.column].value;
    for (var i = 0; i < values.length; i++) {
      if (isValue(row, column, values[i])) {
        sudoku[row][column].status = true;
        sudoku[row][column].value = values[i];
        if (backTrackingSolve(row, column)) {
          return true;
        }
        let backCell = {};
        backCell.status = false;
        backCell.value = values;
        sudoku[location.row][location.column] = backCell;
      }
    }
    return false;
  }

  function findEmtyCell(row, column) {
    for (let r = row; r < sudoku.length; r++) {
      for (let c = column; c < sudoku[r].length; c++) {
        if (!sudoku[r][c].status) {
          let location = {};
          location.row = r;
          location.column = c;
          return location;
        }
      }
      column = 0;
    }
    return "end!";
  }

  function solve(row, column, cells) {
    for (let index = 0; index < cells.length; index++) {
      if (cells[index].status) {
        sudoku[row][column].value = sudoku[row][column].value.filter(val => val != cells[index].value);
        if (sudoku[row][column].value.length == 1) {
          sudoku[row][column].status = true;
          sudoku[row][column].value = sudoku[row][column].value[0];
          break;
        }
      }
    }
  }

  function setUnic(row, column, cells) {
    let notSolvedCells = [];
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i].status) {
        notSolvedCells.push(cells[i]);
      }
    }
    let copyCell = JSON.parse(JSON.stringify(sudoku[row][column]));
    for (let i = 0; i < notSolvedCells.length; i++) {
      notSolvedCells[i].value.forEach(v => {
        copyCell.value = copyCell.value.filter(copyV => copyV != v);
      });
      if (copyCell.value.length == 0) {
        break;
      }
    }
    if (copyCell.value.length != 0) {
      if (sudoku[row][column].value.length == 1) {
        sudoku[row][column].status = true;
        sudoku[row][column].value = copyCell.value[0];
      } else {
        sudoku[row][column].value = copyCell.value;
      }
    }
  }

  function getSquare(row, column) {
    let rows = getSquareIndexies(row);
    let columns = getSquareIndexies(column);
    let squareCells = [];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < columns.length; c++) {
        if (rows[r] == row && columns[c] == column) {
          continue;
        } else {
          squareCells.push(sudoku[rows[r]][columns[c]])
        }
      }
    }
    return squareCells;
  }

  function getRow(row, column) {
    let rowCopy = [...sudoku[row]];
    let rowCells = [];
    for (let index = 0; index < rowCopy.length; index++) {
      if (index != column) {
        rowCells.push(rowCopy[index]);
      }
    }
    return rowCells;
  }

  function getColumn(row, column) {
    let columnCells = []
    for (let index = 0; index < 9; index++) {
      if (index != row) {
        columnCells.push(sudoku[index][column]);
      }
    }
    return columnCells;
  }

  function getSquareIndexies(index) {
    if (index >= 0 && index <= 2) {
      return [0, 1, 2];
    } else if (index >= 3 && index <= 5) {
      return [3, 4, 5];
    } else if (index >= 6 && index <= 8) {
      return [6, 7, 8];
    }
  }

  function isValue(row, column, value) {
    if (
      getSquare(row, column).filter(cell => cell.status).filter(cell => cell.value == value).length >= 1 ||
      getRow(row, column).filter(cell => cell.status).filter(cell => cell.value == value).length >= 1 ||
      getColumn(row, column).filter(cell => cell.status).filter(cell => cell.value == value).length >= 1) {
      return false;
    } else {
      return true;
    }
  }

  function isSolved() {
    for (let row = 0; row < sudoku.length; row++) {
      let stop = false;
      for (let column = 0; column < sudoku[row].length; column++) {
        if (!sudoku[row][column].status) {
          stop = true;
          break;
        }
      }
      if (stop) {
        return false;
      }
    }
    return true;
  }

  function isDiff(copySudoku) {
    for (let row = 0; row < copySudoku.length; row++) {
      for (let column = 0; column < copySudoku[row].length; column++) {
        if (copySudoku[row][column].status != sudoku[row][column].status) {
          return true;
        } else if (!copySudoku[row][column].status) {
          if (copySudoku[row][column].value.length != sudoku[row][column].value.length) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function createSudoku() {
    let sudoku = [];
    matrix.forEach(row => {
      let sudokuRow = [];
      row.forEach(value => {
        let sudokuCell = {};
        if (value != 0) {
          sudokuCell.status = true;
          sudokuCell.value = value;
        } else {
          sudokuCell.status = false;
          sudokuCell.value = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        sudokuRow.push(sudokuCell);
      })
      sudoku.push(sudokuRow);
    });
    return sudoku;
  }
}
