import { db, auth } from "../firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Generates a deterministic seed based on the date
const getDateSeed = () => {
  const today = new Date();
  // UTC date to ensure same crossword worldwide
  return `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
};

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
    
    // Use date-based seed for deterministic shuffle
    const dateSeed = getDateSeed();
    console.log("Using date seed:", dateSeed);
    
    // Deterministic shuffle based on date - same worldwide for a given day
    const shuffledWords = deterministicShuffle(words, dateSeed);
    
    return shuffledWords.slice(0, 20); // Take 20 words for better selection
  } catch (error) {
    console.error("Error loading crossword data:", error);
    return [];
  }
};

// Deterministic shuffle based on a seed
function deterministicShuffle(array, seed) {
  // Create a copy to avoid modifying the original array
  const result = [...array];
  const seedNumber = hashString(seed);
  
  // Fisher-Yates shuffle with deterministic random numbers
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seedNumber + i) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

// Hash a string to a number for seeded random
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Generate a random number based on a seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

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
  if (!auth.currentUser) return null;
  
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    const currentStats = userDoc.exists() ? userDoc.data().crosswordStats || {} : {};
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const wasCompleted = stats.completed === true;
    
    // Calculate streak
    let currentStreak = currentStats.currentStreak || 0;
    let maxStreak = currentStats.maxStreak || 0;
    
    const lastPlayed = currentStats.lastPlayed ? new Date(currentStats.lastPlayed) : null;
    const isConsecutiveDay = lastPlayed ? 
      (now.getTime() - lastPlayed.getTime() < 48 * 60 * 60 * 1000 && 
      lastPlayed.toISOString().split('T')[0] !== today) : 
      false;
    
    if (wasCompleted) {
      if (isConsecutiveDay || !lastPlayed) {
        currentStreak++;
      } else if (!isConsecutiveDay && lastPlayed) {
        currentStreak = 1;
      }
      
      maxStreak = Math.max(currentStreak, maxStreak);
    } else {
      currentStreak = 0;
    }
    
    // Calculate times
    const completedGames = (currentStats.gamesCompleted || 0) + (wasCompleted ? 1 : 0);
    const totalTime = (currentStats.totalTime || 0) + stats.timeElapsed;
    const averageTime = completedGames > 0 ? Math.round(totalTime / completedGames) : 0;
    const bestTime = wasCompleted ? 
      (currentStats.bestTime ? Math.min(currentStats.bestTime, stats.timeElapsed) : stats.timeElapsed) : 
      currentStats.bestTime || 0;

    // Add historical entry
    const historyRef = doc(db, "users", auth.currentUser.uid, "crosswordHistory", today);
    await setDoc(historyRef, {
      completed: wasCompleted,
      timeElapsed: stats.timeElapsed,
      dateCompleted: now.toISOString()
    });
    
    const updatedStats = {
      ...currentStats,
      gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
      gamesCompleted: completedGames,
      gamesWon: (currentStats.gamesWon || 0) + (wasCompleted ? 1 : 0),
      totalTime,
      averageTime,
      bestTime,
      currentStreak,
      maxStreak,
      lastPlayed: now.toISOString()
    };
    
    await setDoc(userRef, {
      ...userDoc.data(),
      crosswordStats: updatedStats
    }, { merge: true });
    
    return updatedStats;
  } catch (error) {
    console.error("Error saving crossword stats:", error);
    return null;
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

// Fixed function to create a 5x5 crossword
export const createSimpleCrosswordData = (words) => {
  // Filter words for suitable candidates (appropriate length, no special chars)
  const filteredWords = words.filter(word => {
    const response = word.response.toUpperCase().trim();
    return response.length >= 3 && response.length <= 15 && /^[A-Z]+$/i.test(response);
  });
  
  if (filteredWords.length < 10) {
    console.error("Not enough valid words for crossword");
    return null;
  }
  
  // Sort words by length (descending)
  const sortedWords = [...filteredWords].sort((a, b) => 
    b.response.length - a.response.length
  );
  
  // Create a new clean grid
  const gridSize = 20; // Larger grid to allow space
  let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
  
  const entries = [];
  let nextNumber = 1;
  
  // Place first word horizontally in center
  const firstWord = sortedWords[0];
  const firstWordText = firstWord.response.toUpperCase().trim();
  const centerRow = Math.floor(gridSize / 2);
  const startCol = Math.floor((gridSize - firstWordText.length) / 2);
  
  // Add to entries
  entries.push({
    id: "across-1",
    direction: "across",
    number: nextNumber,
    humanNumber: nextNumber.toString(),
    clue: firstWord.instruction,
    position: { x: startCol, y: centerRow },
    length: firstWordText.length,
    solution: firstWordText,
    group: ["across-1"],
    separatorLocations: {}
  });
  nextNumber++;
  
  // Mark cells in the grid
  for (let i = 0; i < firstWordText.length; i++) {
    grid[centerRow][startCol + i] = {
      char: firstWordText[i],
      isStart: i === 0,
      number: i === 0 ? 1 : null,
      acrossEntry: "across-1",
      downEntry: null
    };
  }
  
  // Create a list of potential slots for new words
  let remainingWords = sortedWords.slice(1);
  let acrossCount = 1;
  let downCount = 0;
  
  // Attempt to place words until we have 5 across and 5 down
  while ((acrossCount < 5 || downCount < 5) && remainingWords.length > 0) {
    let foundPlacement = false;
    let bestWordIndex = -1;
    let bestPosition = null;
    let bestDirection = null;
    let bestIntersections = -1;
    
    // For each remaining word
    for (let i = 0; i < remainingWords.length; i++) {
      const candidateWord = remainingWords[i].response.toUpperCase().trim();
      
      // Skip if too long for our grid
      if (candidateWord.length > gridSize - 2) continue;
      
      // Try to place across if we need more across words
      if (acrossCount < 5) {
        // Scan the grid for potential across placements
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize - candidateWord.length + 1; col++) {
            // Check if this position works for an across placement
            const intersections = checkAcrossPlacement(grid, candidateWord, row, col);
            if (intersections > 0 && intersections > bestIntersections) {
              bestWordIndex = i;
              bestPosition = { row, col };
              bestDirection = "across";
              bestIntersections = intersections;
              
              // If we found a placement with multiple intersections, prioritize it
              if (intersections > 1) {
                foundPlacement = true;
                break;
              }
            }
          }
          if (foundPlacement) break;
        }
      }
      
      // Try to place down if we need more down words
      if (downCount < 5 && !foundPlacement) {
        // Scan the grid for potential down placements
        for (let col = 0; col < gridSize; col++) {
          for (let row = 0; row < gridSize - candidateWord.length + 1; row++) {
            // Check if this position works for a down placement
            const intersections = checkDownPlacement(grid, candidateWord, row, col);
            if (intersections > 0 && intersections > bestIntersections) {
              bestWordIndex = i;
              bestPosition = { row, col };
              bestDirection = "down";
              bestIntersections = intersections;
              
              // If we found a placement with multiple intersections, prioritize it
              if (intersections > 1) {
                foundPlacement = true;
                break;
              }
            }
          }
          if (foundPlacement) break;
        }
      }
      
      if (foundPlacement) break;
    }
    
    // If we found a valid placement, place the word
    if (bestWordIndex >= 0) {
      const wordToPlace = remainingWords[bestWordIndex];
      const wordText = wordToPlace.response.toUpperCase().trim();
      
      if (bestDirection === "across") {
        // Add entry
        entries.push({
          id: `across-${acrossCount + 1}`,
          direction: "across",
          number: nextNumber,
          humanNumber: nextNumber.toString(),
          clue: wordToPlace.instruction,
          position: { x: bestPosition.col, y: bestPosition.row },
          length: wordText.length,
          solution: wordText,
          group: [`across-${acrossCount + 1}`],
          separatorLocations: {}
        });
        
        // Mark cells in grid
        for (let i = 0; i < wordText.length; i++) {
          const col = bestPosition.col + i;
          const row = bestPosition.row;
          
          if (grid[row][col] === null) {
            grid[row][col] = {
              char: wordText[i],
              isStart: i === 0,
              number: i === 0 ? nextNumber : null,
              acrossEntry: `across-${acrossCount + 1}`,
              downEntry: null
            };
          } else {
            // Cell already has content - mark the intersection
            grid[row][col].acrossEntry = `across-${acrossCount + 1}`;
            // Keep the existing number if this is the start
            if (i === 0 && grid[row][col].number === null) {
              grid[row][col].number = nextNumber;
              grid[row][col].isStart = true;
            }
          }
        }
        
        acrossCount++;
        nextNumber++;
      } else { // bestDirection === "down"
        // Add entry
        entries.push({
          id: `down-${downCount + 1}`,
          direction: "down",
          number: nextNumber,
          humanNumber: nextNumber.toString(),
          clue: wordToPlace.instruction,
          position: { x: bestPosition.col, y: bestPosition.row },
          length: wordText.length,
          solution: wordText,
          group: [`down-${downCount + 1}`],
          separatorLocations: {}
        });
        
        // Mark cells in grid
        for (let i = 0; i < wordText.length; i++) {
          const col = bestPosition.col;
          const row = bestPosition.row + i;
          
          if (grid[row][col] === null) {
            grid[row][col] = {
              char: wordText[i],
              isStart: i === 0,
              number: i === 0 ? nextNumber : null,
              acrossEntry: null,
              downEntry: `down-${downCount + 1}`
            };
          } else {
            // Cell already has content - mark the intersection
            grid[row][col].downEntry = `down-${downCount + 1}`;
            // Keep the existing number if this is the start
            if (i === 0 && grid[row][col].number === null) {
              grid[row][col].number = nextNumber;
              grid[row][col].isStart = true;
            }
          }
        }
        
        downCount++;
        nextNumber++;
      }
      
      // Remove this word from remaining words
      remainingWords.splice(bestWordIndex, 1);
    } else {
      // If no valid placement found, remove the first word and try again
      remainingWords.shift();
    }
    
    // Safety check - if we've tried all words and can't make progress
    if (acrossCount + downCount === 1 && remainingWords.length === 0) {
      console.error("Could not create a proper crossword - not enough words fit");
      return null;
    }
  }
  
  // Trim the grid to the minimum necessary size
  const { trimmedGrid, bounds } = trimGrid(grid);
  
  // Adjust positions of entries based on trimming
  entries.forEach(entry => {
    entry.position.x -= bounds.minCol;
    entry.position.y -= bounds.minRow;
  });
  
  // Log all answers for debugging
  console.log("=== CROSSWORD ANSWERS ===");
  entries.forEach(entry => {
    console.log(`${entry.number} ${entry.direction}: ${entry.solution} - ${entry.clue}`);
  });

  return {
    id: `bible-crossword-${getDateSeed()}`,
    number: 1,
    name: 'Bible Knowledge Daily Crossword',
    creator: { name: 'Bible Wordle' },
    date: Date.now(),
    entries,
    solutionAvailable: true,
    dateSolutionAvailable: Date.now(),
    dimensions: {
      cols: bounds.maxCol - bounds.minCol + 1,
      rows: bounds.maxRow - bounds.minRow + 1,
    },
    crosswordType: 'bible',
  };
};

// Helper function to check if a word can be placed across at a specific position
function checkAcrossPlacement(grid, word, row, col) {
  let intersections = 0;
  
  // Check if there's a letter immediately before or after
  if (col > 0 && grid[row][col - 1] !== null) return 0;
  if (col + word.length < grid[0].length && grid[row][col + word.length] !== null) return 0;
  
  for (let i = 0; i < word.length; i++) {
    const currentCol = col + i;
    const currentCell = grid[row][currentCol];
    
    // If cell is occupied
    if (currentCell !== null) {
      // If the character doesn't match, this placement won't work
      if (currentCell.char !== word[i]) return 0;
      
      // If this letter is the start of an across word, we can't use it
      if (currentCell.acrossEntry !== null) return 0;
      
      // This is a valid intersection with a down word
      intersections++;
    } else {
      // Check if there's a letter above or below
      if (row > 0 && grid[row - 1][currentCol] !== null && i > 0 && i < word.length - 1) return 0;
      if (row < grid.length - 1 && grid[row + 1][currentCol] !== null && i > 0 && i < word.length - 1) return 0;
    }
  }
  
  return intersections;
}

// Helper function to check if a word can be placed down at a specific position
function checkDownPlacement(grid, word, row, col) {
  let intersections = 0;
  
  // Check if there's a letter immediately above or below
  if (row > 0 && grid[row - 1][col] !== null) return 0;
  if (row + word.length < grid.length && grid[row + word.length][col] !== null) return 0;
  
  for (let i = 0; i < word.length; i++) {
    const currentRow = row + i;
    const currentCell = grid[currentRow][col];
    
    // If cell is occupied
    if (currentCell !== null) {
      // If the character doesn't match, this placement won't work
      if (currentCell.char !== word[i]) return 0;
      
      // If this letter is the start of a down word, we can't use it
      if (currentCell.downEntry !== null) return 0;
      
      // This is a valid intersection with an across word
      intersections++;
    } else {
      // Check if there's a letter to the left or right
      if (col > 0 && grid[currentRow][col - 1] !== null && i > 0 && i < word.length - 1) return 0;
      if (col < grid[0].length - 1 && grid[currentRow][col + 1] !== null && i > 0 && i < word.length - 1) return 0;
    }
  }
  
  return intersections;
}

// Helper function to trim the grid to the minimum necessary size
function trimGrid(grid) {
  let minRow = grid.length;
  let minCol = grid[0].length;
  let maxRow = 0;
  let maxCol = 0;
  
  // Find the bounds of the used area
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) {
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
  
  return { 
    trimmedGrid, 
    bounds: { minRow, minCol, maxRow, maxCol } 
  };
}
