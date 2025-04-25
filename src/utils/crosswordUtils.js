import { db, auth } from "../firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Get today's crossword data
export const getTodayCrosswordData = async () => {
  try {
    const response = await fetch("/crossword.jsonl");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    // Parse JSONL format
    const words = text.trim()
      .split("\n")
      .map(line => {
        try {
          return JSON.parse(line.trim());
        } catch (err) {
          console.error("Error parsing line:", line, err);
          return null;
        }
      })
      .filter(Boolean);

    if (words.length === 0) {
      throw new Error("No valid words found");
    }

    // Select a random subset of words for today's puzzle
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20); // Take 20 words for better crossword creation options
  } catch (error) {
    console.error("Error loading crossword data:", error);
    return [];
  }
};

// Check if user has already played today
export const hasPlayedCrosswordToday = () => {
  const lastPlayedDate = localStorage.getItem('lastCrosswordPlayed');
  const today = new Date().toISOString().split('T')[0];
  return lastPlayedDate === today;
};

// Mark that user has played today
export const markCrosswordAsPlayed = () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('lastCrosswordPlayed', today);
};

// Save crossword stats
export const saveCrosswordStats = async (stats) => {
  if (!auth.currentUser) return;
  
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    const currentStats = userDoc.exists() ? userDoc.data().crosswordStats || {} : {};
    
    const updatedStats = {
      ...currentStats,
      gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
      gamesCompleted: (currentStats.gamesCompleted || 0) + (stats.completed ? 1 : 0),
      totalTime: (currentStats.totalTime || 0) + stats.timeElapsed,
      lastPlayed: new Date().toISOString()
    };
    
    await setDoc(userRef, {
      ...userDoc.data(),
      crosswordStats: updatedStats
    }, { merge: true });
    
    return updatedStats;
  } catch (error) {
    console.error("Error saving crossword stats:", error);
  }
};

// Get user's crossword stats
export const getCrosswordStats = async () => {
  if (!auth.currentUser) return null;
  
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().crosswordStats) {
      return userDoc.data().crosswordStats;
    }
    
    return {
      gamesPlayed: 0,
      gamesCompleted: 0,
      totalTime: 0
    };
  } catch (error) {
    console.error("Error getting crossword stats:", error);
    return null;
  }
};

// Improved function to create an interconnected crossword layout
export const createSimpleCrosswordData = (words) => {
  // Filter words to only keep those that are suitable (not too short, no special chars)
  const filteredWords = words.filter(word => {
    const response = word.response.toUpperCase().trim();
    return response.length >= 3 && /^[A-Z]+$/i.test(response);
  });

  // Sort words by length (longest first) to help with placement
  const sortedWords = [...filteredWords].sort((a, b) => 
    b.response.length - a.response.length
  );

  // Set up crossword dimensions - start with enough space
  const gridSize = 30;
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  
  // Start with the longest word horizontally in center
  const entries = [];
  let entryId = 1;
  let numberCounter = 1;
  
  // Place first word horizontally in center
  if (sortedWords.length > 0) {
    const firstWord = sortedWords[0];
    const wordLength = firstWord.response.length;
    const centerRow = Math.floor(gridSize / 2);
    const startCol = Math.floor((gridSize - wordLength) / 2);
    
    // Mark first word in grid
    for (let i = 0; i < wordLength; i++) {
      grid[centerRow][startCol + i] = {
        letter: firstWord.response[i].toUpperCase(),
        entries: [`${entryId}`],
      };
    }
    
    // Add first entry
    entries.push({
      id: `${entryId}-across`,
      number: numberCounter,
      humanNumber: numberCounter.toString(),
      clue: firstWord.instruction,
      direction: 'across',
      length: wordLength,
      group: [`${entryId}-across`],
      position: { x: startCol, y: centerRow },
      separatorLocations: {},
      solution: firstWord.response.toUpperCase(),
    });
    
    entryId++;
    numberCounter++;
  }
  
  // Try to place remaining words by finding intersections
  let remainingWords = sortedWords.slice(1);
  const placedWordIndices = [0]; // First word is already placed
  
  // Multiple passes to maximize word placement
  for (let attempt = 0; attempt < 3; attempt++) {
    const wordsToTryPlacing = [...remainingWords];
    const newlyPlacedIndices = [];
    
    for (let wordIndex = 0; wordIndex < wordsToTryPlacing.length; wordIndex++) {
      const word = wordsToTryPlacing[wordIndex].response.toUpperCase();
      let placed = false;
      
      // Try to find an intersection with any already placed word
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (!grid[row][col] || !grid[row][col].letter) continue;
          
          const cell = grid[row][col];
          const letter = cell.letter;
          
          // Check if this letter appears in our word
          for (let charPos = 0; charPos < word.length; charPos++) {
            if (word[charPos] !== letter) continue;
            
            // Try to place word vertically
            if (canPlaceWordVertically(grid, word, row, col, charPos)) {
              // Check if this position already has a numbered cell
              let number = null;
              if (row - charPos === 0 || !grid[row - charPos - 1] || !grid[row - charPos - 1][col]) {
                // This is a starting point - needs a number
                number = numberCounter++;
              }
              
              // Place word
              for (let i = 0; i < word.length; i++) {
                const r = row - charPos + i;
                if (!grid[r][col]) {
                  grid[r][col] = {
                    letter: word[i],
                    entries: [`${entryId}`],
                  };
                } else {
                  // Add this entry to the cell's entries array
                  grid[r][col].entries.push(`${entryId}`);
                }
              }
              
              // Add entry
              entries.push({
                id: `${entryId}-down`,
                number: number,
                humanNumber: number ? number.toString() : "",
                clue: wordsToTryPlacing[wordIndex].instruction,
                direction: 'down',
                length: word.length,
                group: [`${entryId}-down`],
                position: { x: col, y: row - charPos },
                separatorLocations: {},
                solution: word,
              });
              
              entryId++;
              placed = true;
              newlyPlacedIndices.push(wordIndex);
              break;
            }
            
            // Try to place word horizontally
            if (canPlaceWordHorizontally(grid, word, row, col, charPos)) {
              // Check if this position needs a number
              let number = null;
              if (col - charPos === 0 || !grid[row][col - charPos - 1]) {
                // This is a starting point - needs a number
                number = numberCounter++;
              }
              
              // Place word
              for (let i = 0; i < word.length; i++) {
                const c = col - charPos + i;
                if (!grid[row][c]) {
                  grid[row][c] = {
                    letter: word[i],
                    entries: [`${entryId}`],
                  };
                } else {
                  // Add this entry to the cell's entries array
                  grid[row][c].entries.push(`${entryId}`);
                }
              }
              
              // Add entry
              entries.push({
                id: `${entryId}-across`,
                number: number,
                humanNumber: number ? number.toString() : "",
                clue: wordsToTryPlacing[wordIndex].instruction,
                direction: 'across',
                length: word.length,
                group: [`${entryId}-across`],
                position: { x: col - charPos, y: row },
                separatorLocations: {},
                solution: word,
              });
              
              entryId++;
              placed = true;
              newlyPlacedIndices.push(wordIndex);
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
    }
    
    // Remove placed words from remainingWords
    remainingWords = remainingWords.filter((_, i) => !newlyPlacedIndices.includes(i));
    
    // If no words were placed in this iteration, break the loop
    if (newlyPlacedIndices.length === 0) break;
  }
  
  // Trim the grid to the minimum size needed
  const { trimmedGrid, minRow, minCol, maxRow, maxCol } = trimGrid(grid);
  
  // Adjust positions of entries based on trimming
  entries.forEach(entry => {
    entry.position.x -= minCol;
    entry.position.y -= minRow;
  });

  // Log all answers for debugging
  console.log("=== CROSSWORD ANSWERS ===");
  entries.forEach(entry => {
    console.log(`${entry.number} ${entry.direction}: ${entry.solution} - ${entry.clue}`);
  });

  return {
    id: `bible-crossword-${new Date().toISOString().split('T')[0]}`,
    number: 1,
    name: 'Bible Knowledge Daily Crossword',
    creator: { name: 'Bible Wordle' },
    date: Date.now(),
    entries,
    solutionAvailable: true,
    dateSolutionAvailable: Date.now(),
    dimensions: {
      cols: maxCol - minCol + 1,
      rows: maxRow - minRow + 1,
    },
    crosswordType: 'bible',
  };
};

// Helper functions
function canPlaceWordVertically(grid, word, intersectionRow, col, charPos) {
  const startRow = intersectionRow - charPos;
  
  // Check if the starting position would be valid
  if (startRow < 0) return false;
  
  // Check if the word would fit vertically
  if (startRow + word.length > grid.length) return false;
  
  // Check for conflicts with existing letters
  for (let i = 0; i < word.length; i++) {
    const r = startRow + i;
    // Skip the intersection point since we know it matches
    if (r === intersectionRow) continue;
    
    // Check if cell already has a letter that doesn't match
    if (grid[r][col] && grid[r][col].letter !== word[i]) {
      return false;
    }
    
    // Check if surrounding cells are occupied (to avoid adjacent words)
    if (i !== 0 && i !== word.length - 1) { // Skip checks for first and last letter
      if ((col > 0 && grid[r][col-1]) || 
          (col < grid[0].length-1 && grid[r][col+1])) {
        return false; // Adjacent cells occupied horizontally
      }
    }
  }
  
  // Check if there's a letter immediately before the word
  if (startRow > 0 && grid[startRow-1][col]) {
    return false;
  }
  
  // Check if there's a letter immediately after the word
  if (startRow + word.length < grid.length && grid[startRow + word.length][col]) {
    return false;
  }
  
  return true;
}

function canPlaceWordHorizontally(grid, word, row, intersectionCol, charPos) {
  const startCol = intersectionCol - charPos;
  
  // Check if the starting position would be valid
  if (startCol < 0) return false;
  
  // Check if the word would fit horizontally
  if (startCol + word.length > grid[0].length) return false;
  
  // Check for conflicts with existing letters
  for (let i = 0; i < word.length; i++) {
    const c = startCol + i;
    // Skip the intersection point since we know it matches
    if (c === intersectionCol) continue;
    
    // Check if cell already has a letter that doesn't match
    if (grid[row][c] && grid[row][c].letter !== word[i]) {
      return false;
    }
    
    // Check if surrounding cells are occupied (to avoid adjacent words)
    if (i !== 0 && i !== word.length - 1) { // Skip checks for first and last letter
      if ((row > 0 && grid[row-1][c]) || 
          (row < grid.length-1 && grid[row+1][c])) {
        return false; // Adjacent cells occupied vertically
      }
    }
  }
  
  // Check if there's a letter immediately before the word
  if (startCol > 0 && grid[row][startCol-1]) {
    return false;
  }
  
  // Check if there's a letter immediately after the word
  if (startCol + word.length < grid[0].length && grid[row][startCol + word.length]) {
    return false;
  }
  
  return true;
}

function trimGrid(grid) {
  let minRow = grid.length;
  let minCol = grid[0].length;
  let maxRow = 0;
  let maxCol = 0;
  
  // Find the boundaries of the used area
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        minRow = Math.min(minRow, r);
        minCol = Math.min(minCol, c);
        maxRow = Math.max(maxRow, r);
        maxCol = Math.max(maxCol, c);
      }
    }
  }
  
  // Create a new grid of minimum size
  const trimmedGrid = [];
  for (let r = minRow; r <= maxRow; r++) {
    trimmedGrid[r - minRow] = [];
    for (let c = minCol; c <= maxCol; c++) {
      trimmedGrid[r - minRow][c - minCol] = grid[r][c];
    }
  }
  
  return { trimmedGrid, minRow, minCol, maxRow, maxCol };
}
