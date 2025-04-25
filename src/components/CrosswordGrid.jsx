import React from 'react';
import { motion } from 'framer-motion';

export default function CrosswordGrid({ 
  grid, 
  userInput, 
  selectedCell, 
  direction, 
  onCellClick 
}) {
  if (!grid || !userInput) return null;

  // Calculate cell size based on grid size for mobile responsiveness
  const getCellSize = () => {
    const gridSize = grid.length;
    if (gridSize <= 10) return 'w-10 h-10 text-lg';
    if (gridSize <= 15) return 'w-8 h-8 text-base';
    return 'w-6 h-6 text-sm';
  };

  const cellSize = getCellSize();

  // Check if a cell is part of the current word
  const isCellInCurrentWord = (row, col) => {
    if (!selectedCell) return false;

    // Simple check for cells in same row or column as selected cell
    if (direction === 'across' && row === selectedCell.row) {
      // Find the boundaries of the word
      let startCol = selectedCell.col;
      let endCol = selectedCell.col;
      
      // Look left to find start of word
      while (startCol > 0 && grid[row][startCol - 1]) {
        startCol--;
      }
      
      // Look right to find end of word
      while (endCol < grid[row].length - 1 && grid[row][endCol + 1]) {
        endCol++;
      }
      
      // Check if our cell is within these boundaries
      return col >= startCol && col <= endCol;
    } 
    else if (direction === 'down' && col === selectedCell.col) {
      // Find the boundaries of the word
      let startRow = selectedCell.row;
      let endRow = selectedCell.row;
      
      // Look up to find start of word
      while (startRow > 0 && grid[startRow - 1][col]) {
        startRow--;
      }
      
      // Look down to find end of word
      while (endRow < grid.length - 1 && grid[endRow + 1][col]) {
        endRow++;
      }
      
      // Check if our cell is within these boundaries
      return row >= startRow && row <= endRow;
    }
    
    return false;
  };

  return (
    <div className="overflow-auto flex justify-center pb-4">
      <div className="relative">
        <div 
          className="grid gap-0.5"
          style={{ 
            gridTemplateRows: `repeat(${grid.length}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`
          }}
        >
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <React.Fragment key={`${rowIndex}-${colIndex}`}>
                {cell ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      ${cellSize}
                      border-2
                      flex items-center justify-center
                      font-bold relative
                      ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex 
                        ? 'bg-purple-500/50 border-purple-400'
                        : 'bg-white/5 border-gray-700'
                      }
                      transition-colors duration-200
                    `}
                    onClick={() => onCellClick(rowIndex, colIndex)}
                  >
                    {cell.number && (
                      <span className="absolute text-[9px] top-0 left-0.5 text-gray-400 font-normal">
                        {cell.number}
                      </span>
                    )}
                    <span className="text-white">
                      {userInput[rowIndex][colIndex]}
                    </span>
                  </motion.div>
                ) : (
                  <div className="bg-transparent" />
                )}
              </React.Fragment>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}
