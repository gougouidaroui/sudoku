'use client';
import { useEffect, useState } from 'react';
import './globals.css';

// Helper functions moved to module scope
function unUsedInBox(grid, rowStart, colStart, num) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[rowStart + i][colStart + j] === num) {
        return false;
      }
    }
  }
  return true;
}

function unUsedInRow(grid, i, num) {
  for (let j = 0; j < 9; j++) {
    if (grid[i][j] === num) {
      return false;
    }
  }
  return true;
}

function unUsedInCol(grid, j, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[i][j] === num) {
      return false;
    }
  }
  return true;
}

function checkIfSafe(grid, i, j, num) {
  return (
    unUsedInRow(grid, i, num) &&
    unUsedInCol(grid, j, num) &&
    unUsedInBox(grid, i - (i % 3), j - (j % 3), num)
  );
}

function makeSudoku() {
  function fillBox(grid, row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!unUsedInBox(grid, row, col, num));
        grid[row + i][col + j] = num;
      }
    }
  }

  function fillDiagonal(grid) {
    for (let i = 0; i < 9; i += 3) {
      fillBox(grid, i, i);
    }
  }

  function fillRemaining(grid, i, j) {
    if (i === 9) {
      return true;
    }
    if (j === 9) {
      return fillRemaining(grid, i + 1, 0);
    }
    if (grid[i][j] !== 0) {
      return fillRemaining(grid, i, j + 1);
    }
    for (let num = 1; num <= 9; num++) {
      if (checkIfSafe(grid, i, j, num)) {
        grid[i][j] = num;
        if (fillRemaining(grid, i, j + 1)) {
          return true;
        }
        grid[i][j] = 0;
      }
    }
    return false;
  }

  function removeKDigits(grid, k) {
    while (k > 0) {
      let cellId = Math.floor(Math.random() * 81);
      let i = Math.floor(cellId / 9);
      let j = cellId % 9;
      if (grid[i][j] !== 0) {
        grid[i][j] = 0;
        k--;
      }
    }
  }

  function sudokuGenerator(k) {
    let grid = new Array(9).fill(0).map(() => new Array(9).fill(0));
    fillDiagonal(grid);
    fillRemaining(grid, 0, 0);
    removeKDigits(grid, k);
    return grid;
  }

  let k = 45;
  return sudokuGenerator(k);
}

function checkSudokuSolved(grid) {
  // Check for empty cells
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        return false;
      }
    }
  }

  // Check rows
  for (let i = 0; i < 9; i++) {
    const row = new Set();
    for (let j = 0; j < 9; j++) {
      if (row.has(grid[i][j]) || grid[i][j] < 1 || grid[i][j] > 9) {
        return false;
      }
      row.add(grid[i][j]);
    }
  }

  // Check columns
  for (let j = 0; j < 9; j++) {
    const col = new Set();
    for (let i = 0; i < 9; i++) {
      if (col.has(grid[i][j]) || grid[i][j] < 1 || grid[i][j] > 9) {
        return false;
      }
      col.add(grid[i][j]);
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const box = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const num = grid[boxRow + i][boxCol + j];
          if (box.has(num) || num < 1 || num > 9) {
            return false;
          }
          box.add(num);
        }
      }
    }
  }

  return true;
}

export default function Home() {
  const [sudokuGrid, setSudokuGrid] = useState(
    new Array(9).fill(0).map(() => new Array(9).fill(0))
  );
  const [initialGrid, setInitialGrid] = useState(
    new Array(9).fill(0).map(() => new Array(9).fill(0))
  );
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null); // [row, col] or null
  const [showWinModal, setShowWinModal] = useState(false);

  useEffect(() => {
    const grid = makeSudoku();
    setSudokuGrid(grid);
    setInitialGrid(grid.map(row => [...row]));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (key >= '0' && key <= '9') {
        const num = parseInt(key);
        setSelectedNumber(selectedNumber === num ? null : num);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNumber]);

  const handleCellClick = (rowIndex, colIndex) => {
    // Toggle selected cell
    if (selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex) {
      setSelectedCell(null);
    } else {
      setSelectedCell([rowIndex, colIndex]);
    }

    // Handle number placement if a number is selected and the cell is editable
    if (selectedNumber !== null && initialGrid[rowIndex][colIndex] === 0) {
      if (selectedNumber === 0) {
        // Allow deletion
        const newGrid = sudokuGrid.map(row => [...row]);
        newGrid[rowIndex][colIndex] = 0;
        setSudokuGrid(newGrid);
      } else {
        // Validate move for numbers 1-9
        if (checkIfSafe(sudokuGrid, rowIndex, colIndex, selectedNumber)) {
          const newGrid = sudokuGrid.map(row => [...row]);
          newGrid[rowIndex][colIndex] = selectedNumber;
          setSudokuGrid(newGrid);
        } else {
          alert('Invalid move: Number already exists in row, column, or box!');
        }
      }
    }
  };

  const handleNumberClick = (num) => {
    setSelectedNumber(selectedNumber === num ? null : num);
  };

  const handleSubmit = () => {
    if (checkSudokuSolved(sudokuGrid)) {
      setShowWinModal(true);
    } else {
      alert('The Sudoku is not solved yet. Keep trying!');
    }
  };

  const handleNewGame = () => {
    const grid = makeSudoku();
    setSudokuGrid(grid);
    setInitialGrid(grid.map(row => [...row]));
    setShowWinModal(false);
    setSelectedNumber(null);
    setSelectedCell(null);
  };

  const getHighlightClass = (rowIndex, colIndex) => {
    if (!selectedCell) return '';
    const [selectedRow, selectedCol] = selectedCell;
    const selectedValue = sudokuGrid[selectedRow][selectedCol];

    // Highlight same value
    if (
      sudokuGrid[rowIndex][colIndex] === selectedValue &&
      selectedValue !== 0
    ) {
      return 'bg-yellow-200';
    }
    // Highlight row or column
    if (rowIndex === selectedRow || colIndex === selectedCol) {
      return 'bg-blue-100';
    }
    return '';
  };

  return (
    <>
      <header className="bg-gray-800 text-white text-center py-4">
        <h1 className="text-2xl font-bold">Sudoku</h1>
      </header>
      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="game">
          <div className="inner-border p-4 bg-white shadow-lg">
            <table className="border-collapse">
              <tbody>
                {sudokuGrid.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 3 === 2 ? 'border-b-2 border-black' : ''}
                  >
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={`w-12 h-10 text-center text-lg border border-gray-300 ${
                          colIndex % 3 === 2 ? 'border-r-2 border-black' : ''
                        } ${
                          initialGrid[rowIndex][colIndex] !== 0
                            ? 'bg-gray-200 cursor-not-allowed'
                            : 'cursor-pointer hover:bg-gray-100'
                        } ${getHighlightClass(rowIndex, colIndex)}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell !== 0 ? cell : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="number-row mt-4">
              <table className="border-collapse">
                <tbody>
                  <tr>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <td
                        key={num}
                        className={`w-12 h-10 text-center text-lg border border-gray-300 cursor-pointer hover:bg-gray-200 ${
                          selectedNumber === num ? 'bg-blue-300' : ''
                        }`}
                        onClick={() => handleNumberClick(num)}
                      >
                        {num === 0 ? 'X' : num}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="submit-button mt-4 text-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </main>
      {showWinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="mb-4">You solved the Sudoku!</p>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleNewGame}
            >
              New Game
            </button>
          </div>
        </div>
      )}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>Built with Next.js and Tailwind CSS</p>
      </footer>
    </>
  );
}
