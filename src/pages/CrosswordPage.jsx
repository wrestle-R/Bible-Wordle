import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { FiClock, FiHelpCircle, FiCheck, FiRefreshCw, FiAward, FiTrendingUp, FiTarget, FiCalendar, FiBarChart2 } from "react-icons/fi";
import { auth } from "../firebase.config";
import Navbar from "../components/Navbar";
import CrosswordKeyboard from "../components/CrosswordKeyboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getTodayCrosswordData, 
  createSimpleCrosswordData,
  saveCrosswordStats, 
  getCrosswordStats, 
  hasPlayedCrosswordToday,
  markCrosswordAsPlayed
} from "../utils/crosswordUtils";

export default function CrosswordPage() {
  // Add timer ref
  const timerInterval = useRef(null);
  const [loading, setLoading] = useState(true);
  const [crosswordData, setCrosswordData] = useState(null);
  const [userInput, setUserInput] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResults, setValidationResults] = useState({
    correct: [],
    incorrect: [],
    empty: []
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    maxStreak: 0,
    bestTime: null,
    averageTime: 0,
    gamesWon: 0,
    gamesPlayed: 0,
    lastPlayed: null
  });
  
  // Initialize crossword data
  useEffect(() => {
    const initCrossword = async () => {
      setLoading(true);
      try {
        // Check if already played today
        const alreadyPlayed = hasPlayedCrosswordToday();
        if (alreadyPlayed) {
          setIsPracticeMode(true);
          toast("You've already completed today's crossword. Playing in practice mode.", {
            icon: 'ℹ️',
            style: {
              background: '#1e293b',
              color: '#fff',
            },
          });
        }
        
        // Load saved state from session storage
        const savedTimeElapsed = sessionStorage.getItem('crosswordTimeElapsed');
        const savedUserInput = sessionStorage.getItem('crosswordUserInput');
        const savedGameCompleted = sessionStorage.getItem('crosswordGameCompleted');
        
        if (savedTimeElapsed) {
          setTimeElapsed(parseInt(savedTimeElapsed, 10));
        }
        
        if (savedGameCompleted === 'true') {
          setGameCompleted(true);
        }
        
        // Get today's crossword words
        const words = await getTodayCrosswordData();
        if (!words || words.length === 0) {
          toast("Failed to load crossword data", {
            icon: '❌',
            style: {
              background: '#7f1d1d',
              color: '#fff',
            },
          });
          return;
        }
        
        // Generate crossword data
        const crossword = createSimpleCrosswordData(words);
        if (!crossword) {
          throw new Error("Could not build today's crossword");
        }
        setCrosswordData(crossword);

        const firstEntry = crossword.entries[0];
        if (firstEntry) {
          setSelectedWord(firstEntry);
          setSelectedCell({
            row: firstEntry.position.y,
            col: firstEntry.position.x,
            entry: firstEntry,
            letterIndex: 0,
          });
        }
        
        // Initialize user input grid - from session storage if available
        const maxRow = crossword.dimensions.rows;
        const maxCol = crossword.dimensions.cols;
        let initialInput;
        
        if (savedUserInput) {
          initialInput = JSON.parse(savedUserInput);
          
          // Ensure the grid has correct dimensions (in case of changes)
          if (initialInput.length !== maxRow || initialInput[0].length !== maxCol) {
            initialInput = Array(maxRow).fill(null).map(() => Array(maxCol).fill(""));
          }
        } else {
          initialInput = Array(maxRow).fill(null).map(() => Array(maxCol).fill(""));
        }
        
        setUserInput(initialInput);
        
        // Start timer only if game not completed and not already played
        if (savedGameCompleted !== 'true' && !alreadyPlayed) {
          timerInterval.current = setInterval(() => {
            setTimeElapsed(prev => {
              const newTime = prev + 1;
              sessionStorage.setItem('crosswordTimeElapsed', newTime.toString());
              return newTime;
            });
          }, 1000);
        }
        
      } catch (error) {
        console.error("Error initializing crossword:", error);
        toast("Failed to load crossword", {
          icon: '❌',
          style: {
            background: '#7f1d1d',
            color: '#fff',
          },
        });
      } finally {
        setLoading(false);
      }
    };
    
    initCrossword();
    
    // Clean up timer
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, []);
  
  // Save user input to session storage whenever it changes
  useEffect(() => {
    if (userInput.length > 0) {
      sessionStorage.setItem('crosswordUserInput', JSON.stringify(userInput));
    }
  }, [userInput]);
  
  // Save game completed state to session storage
  useEffect(() => {
    if (gameCompleted) {
      sessionStorage.setItem('crosswordGameCompleted', 'true');
    }
  }, [gameCompleted]);

  // Add auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      if (user) {
        loadUserStats();
      }
    });
    return () => unsubscribe();
  }, []);

  // Modify loadUserStats to fetch all stats
  const loadUserStats = async () => {
    try {
      const stats = await getCrosswordStats();
      if (stats) {
        setUserStats({
          currentStreak: stats.currentStreak || 0,
          maxStreak: stats.maxStreak || 0,
          bestTime: stats.bestTime || null,
          averageTime: stats.averageTime || 0,
          gamesWon: stats.gamesWon || 0,
          gamesPlayed: stats.gamesPlayed || 0,
          lastPlayed: stats.lastPlayed || null
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (!selectedCell || !selectedWord) return;
    
    const { row, col, letterIndex, entry } = selectedCell;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswers();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      // Delete the current letter
      const newInput = [...userInput];
      newInput[row][col] = '';
      setUserInput(newInput);
      
      // Move to the previous letter
      if (letterIndex > 0) {
        moveToAdjacent(-1);
      }
    } else if (e.key.match(/^[a-zA-Z]$/)) {
      // Enter a letter
      const newInput = [...userInput];
      newInput[row][col] = e.key.toUpperCase();
      setUserInput(newInput);
      
      // Move to the next letter
      if (letterIndex < entry.solution.length - 1) {
        moveToAdjacent(1);
      }
    } else if (e.key === 'ArrowRight' && selectedWord.direction === 'across') {
      moveToAdjacent(1);
    } else if (e.key === 'ArrowLeft' && selectedWord.direction === 'across') {
      moveToAdjacent(-1);
    } else if (e.key === 'ArrowDown' && selectedWord.direction === 'down') {
      moveToAdjacent(1);
    } else if (e.key === 'ArrowUp' && selectedWord.direction === 'down') {
      moveToAdjacent(-1);
    }
  };
  
  // Move to adjacent cell in the current word
  const moveToAdjacent = (delta) => {
    if (!selectedCell || !selectedWord) return;
    
    const { letterIndex, entry } = selectedCell;
    const newIndex = letterIndex + delta;
    
    if (newIndex >= 0 && newIndex < entry.solution.length) {
      selectLetterInWord(selectedWord, newIndex);
    }
  };
  
  // Handle cell click with focus management
  const handleCellClick = (row, col) => {
    // Find entries that contain this cell
    const entries = findEntriesByPosition(row, col);
    if (entries.length === 0) return;
    
    // If we're already selected and clicking the same cell, toggle between available entries
    if (selectedCell && selectedCell.row === row && selectedCell.col === col && entries.length > 1) {
      // Find the next entry in the cycle
      const currentEntryIndex = entries.findIndex(e => e.id === selectedWord.id);
      const nextEntry = entries[(currentEntryIndex + 1) % entries.length];
      setSelectedWord(nextEntry);
      
      const letterIndex = calcLetterIndex(nextEntry, row, col);
      setSelectedCell({ row, col, entry: nextEntry, letterIndex });
    } 
    // Otherwise, select the first entry or toggle direction if there are entries in both directions
    else {
      let acrossEntry = entries.find(e => e.direction === 'across');
      let downEntry = entries.find(e => e.direction === 'down');
      
      // If both directions available, prefer the current direction or toggle
      let entryToUse;
      if (acrossEntry && downEntry) {
        if (selectedWord && selectedWord.direction === 'across' && selectedCell?.row === row && selectedCell?.col === col) {
          entryToUse = downEntry;
        } else {
          entryToUse = acrossEntry;
        }
      } else {
        entryToUse = acrossEntry || downEntry;
      }
      
      setSelectedWord(entryToUse);
      const letterIndex = calcLetterIndex(entryToUse, row, col);
      setSelectedCell({ row, col, entry: entryToUse, letterIndex });
    }
  };
  
  // Handle clue click
  const handleClueClick = (entry) => {
    setSelectedWord(entry);
    selectLetterInWord(entry, 0);
  };
  
  // Select a specific letter in a word
  const selectLetterInWord = (entry, letterIndex) => {
    if (!entry || letterIndex < 0 || letterIndex >= entry.solution.length) return;
    
    const row = entry.direction === 'across' ? 
      entry.position.y : 
      entry.position.y + letterIndex;
      
    const col = entry.direction === 'across' ? 
      entry.position.x + letterIndex : 
      entry.position.x;
      
    setSelectedCell({ row, col, entry, letterIndex });
  };
  
  // Find all entries that contain the given position
  const findEntriesByPosition = (row, col) => {
    if (!crosswordData) return [];
    
    return crosswordData.entries.filter(entry => {
      if (entry.direction === 'across') {
        return row === entry.position.y && 
               col >= entry.position.x && 
               col < entry.position.x + entry.length;
      } else {
        return col === entry.position.x && 
               row >= entry.position.y && 
               row < entry.position.y + entry.length;
      }
    });
  };
  
  // Calculate letter index in a word from grid position
  const calcLetterIndex = (entry, row, col) => {
    if (entry.direction === 'across') {
      return col - entry.position.x;
    } else {
      return row - entry.position.y;
    }
  };
  
  // Check if a cell is part of the selected word
  const isInSelectedWord = (row, col) => {
    if (!selectedWord) return false;
    
    if (selectedWord.direction === 'across') {
      return row === selectedWord.position.y && 
             col >= selectedWord.position.x && 
             col < selectedWord.position.x + selectedWord.length;
    } else {
      return col === selectedWord.position.x && 
             row >= selectedWord.position.y && 
             row < selectedWord.position.y + selectedWord.length;
    }
  };
  
  // Check if a cell should be shown in the grid
  const isCellInGrid = (row, col) => {
    if (!crosswordData) return false;
    
    return crosswordData.entries.some(entry => {
      if (entry.direction === 'across') {
        return row === entry.position.y && 
               col >= entry.position.x && 
               col < entry.position.x + entry.length;
      } else {
        return col === entry.position.x && 
               row >= entry.position.y && 
               row < entry.position.y + entry.length;
      }
    });
  };
  
  // Check if a cell should display a number
  const getCellNumber = (row, col) => {
    if (!crosswordData) return null;
    
    // Find any entry that starts at this position
    const entriesAtPosition = crosswordData.entries.filter(entry => 
      entry.position.x === col && entry.position.y === row
    );
    
    if (entriesAtPosition.length > 0) {
      // Return the smallest number if multiple entries start at this position
      return Math.min(...entriesAtPosition.map(entry => entry.number));
    }
    
    return null;
  };
  
  // Check answers button functionality fix
  const checkAnswers = async () => {
    if (!crosswordData) return;
    
    let allCorrect = true;
    let allFilled = true;
    
    const correct = [];
    const incorrect = [];
    const empty = [];
    
    // Debug log
    
    
    for (const entry of crosswordData.entries) {
      let entryCorrect = true;
      let entryFilled = true;
      const userAnswer = [];
      
      for (let i = 0; i < entry.length; i++) {
        const row = entry.direction === 'across' ? 
          entry.position.y : 
          entry.position.y + i;
          
        const col = entry.direction === 'across' ? 
          entry.position.x + i : 
          entry.position.x;
        
        const expectedLetter = entry.solution[i];
        const userLetter = userInput[row]?.[col] || '';
        
        userAnswer.push(userLetter);
        
        // Debug log cell contents
        
        
        if (!userLetter) {
          allFilled = false;
          entryFilled = false;
        } else if (userLetter !== expectedLetter) {
          allCorrect = false;
          entryCorrect = false;
        }
      }
      
      const entryResult = {
        entry,
        userAnswer: userAnswer.join(''),
        expected: entry.solution
      };
      
      if (!entryFilled) {
        empty.push(entryResult);
      } else if (entryCorrect) {
        correct.push(entryResult);
      } else {
        incorrect.push(entryResult);
      }
    }
    
    
    
    // Set validation results and show modal
    setValidationResults({
      correct,
      incorrect,
      empty,
      allCorrect,
      allFilled
    });
    setShowValidationModal(true);
    
    if (allFilled && allCorrect) {
      await handleGameComplete(true);
    }
  };

  const handleVirtualKey = (key) => {
    if (key === "ENTER") {
      checkAnswers();
      return;
    }
    if (!selectedCell || !selectedWord) return;

    const { row, col, letterIndex, entry } = selectedCell;
    if (key === "BACKSPACE") {
      setUserInput((current) => {
        const next = current.map((line) => [...line]);
        next[row][col] = "";
        return next;
      });
      if (letterIndex > 0) moveToAdjacent(-1);
      return;
    }

    if (/^[A-Z]$/.test(key)) {
      setUserInput((current) => {
        const next = current.map((line) => [...line]);
        next[row][col] = key;
        return next;
      });
      if (letterIndex < entry.solution.length - 1) moveToAdjacent(1);
    }
  };

  // Close validation modal
  const closeValidationModal = () => {
    setShowValidationModal(false);
  };
  
  // Handle game completion
  const handleGameComplete = async (completed) => {
    if (gameCompleted) return;
    
    // Stop the timer immediately
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    setGameCompleted(true);
    sessionStorage.setItem('crosswordGameCompleted', 'true');
    
    // Save stats if not in practice mode
    if (!isPracticeMode) {
      markCrosswordAsPlayed();
    }

    if (!isPracticeMode && auth.currentUser) {
      const today = new Date().toISOString().split('T')[0];
      const stats = await getCrosswordStats();
      
      // Check if already played today
      const lastPlayed = stats?.lastPlayed ? new Date(stats.lastPlayed).toISOString().split('T')[0] : null;
      
      // Only update stats if not already played today
      if (lastPlayed !== today) {
        const updatedStats = await saveCrosswordStats({ 
          completed, 
          timeElapsed,
          date: today
        });
        
        if (updatedStats) {
          setUserStats({
            currentStreak: updatedStats.currentStreak || 0,
            maxStreak: updatedStats.maxStreak || 0,
            bestTime: updatedStats.bestTime || null,
            averageTime: updatedStats.averageTime || 0,
            gamesWon: updatedStats.gamesWon || 0,
            gamesPlayed: updatedStats.gamesPlayed || 0,
            lastPlayed: updatedStats.lastPlayed || null
          });
        }
        
      }
    }
    
    // Show toast
    if (completed) {
      toast(`Congratulations! You completed the crossword in ${formatTime(timeElapsed)}`, {
        icon: '🎉',
        style: {
          background: '#065f46',
          color: '#fff',
        },
      });
    }
  };
  
  // Reset the crossword
  const resetCrossword = () => {
    if (!crosswordData) return;
    
    // Stop existing timer
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Start new timer
    timerInterval.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        sessionStorage.setItem('crosswordTimeElapsed', newTime.toString());
        return newTime;
      });
    }, 1000);
    
    const maxRow = crosswordData.dimensions.rows;
    const maxCol = crosswordData.dimensions.cols;
    const emptyInput = Array(maxRow).fill(null).map(() => Array(maxCol).fill(""));
    setUserInput(emptyInput);
    setTimeElapsed(0);
    setGameCompleted(false);
    
    // Clear session storage
    sessionStorage.removeItem('crosswordUserInput');
    sessionStorage.removeItem('crosswordTimeElapsed');
    sessionStorage.removeItem('crosswordGameCompleted');
    
    toast("Crossword has been reset", {
      icon: '🔄',
      style: {
        background: '#1e293b',
        color: '#fff',
      },
    });
  };

  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="crossword-page min-h-screen bg-background pb-52 text-foreground md:pb-8" data-completed={gameCompleted} onKeyDown={handleKeyDown} tabIndex={0}>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-3 pb-8 pt-24 sm:px-5 lg:px-8">
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Daily puzzle</p>
          <h1
            className="mb-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Bible Crossword
          </h1>
          <p
            className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Test your biblical knowledge with today's crossword puzzle
          </p>
          </div>
          {isPracticeMode && (
            <span className="inline-flex w-fit items-center rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              Practice mode
            </span>
          )}
        </header>

        {/* Stats Dashboard */}
        {isLoggedIn ? (
          <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="mb-1 flex items-center gap-2">
                <FiTrendingUp className="text-primary" />
                <span className="text-xs text-muted-foreground sm:text-sm">Current streak</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-foreground">{userStats.currentStreak}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="mb-1 flex items-center gap-2">
                <FiAward className="text-primary" />
                <span className="text-xs text-muted-foreground sm:text-sm">Best streak</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-foreground">{userStats.maxStreak}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="mb-1 flex items-center gap-2">
                <FiTarget className="text-primary" />
                <span className="text-xs text-muted-foreground sm:text-sm">Success rate</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-foreground">
                {userStats.gamesPlayed > 0 
                  ? `${Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)}%` 
                  : '0%'}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="mb-1 flex items-center gap-2">
                <FiClock className="text-primary" />
                <span className="text-xs text-muted-foreground sm:text-sm">Best time</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-foreground">{formatTime(userStats.bestTime)}</div>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-xl border border-border bg-card px-4 py-3 sm:mb-6">
            <div className="text-sm text-muted-foreground">
              Sign in to save your crossword stats and build a daily streak.
            </div>
          </div>
        )}

        {/* Stats & Controls */}
        <Card className="mb-4 gap-0 border-border bg-card shadow-sm sm:mb-5">
          <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-secondary px-3 font-mono text-base font-semibold tabular-nums text-secondary-foreground">
                <FiClock aria-hidden="true" />
                {formatTime(timeElapsed)}
              </span>
              <p className="min-w-0 text-sm leading-snug text-muted-foreground">
                {selectedWord ? (
                  <><span className="font-semibold text-foreground">{selectedWord.number} {selectedWord.direction}</span><span className="mx-1.5">·</span>{selectedWord.clue}</>
                ) : "Select a square or clue to get started."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowInstructions(true)} aria-label="How to play">
                <FiHelpCircle aria-hidden="true" />
                <span className="hidden sm:inline">How to play</span>
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={resetCrossword} aria-label="Reset crossword" title="Reset crossword">
                <FiRefreshCw aria-hidden="true" />
              </Button>
              <Button type="button" size="sm" onClick={checkAnswers} className="hidden md:inline-flex">
                <FiCheck aria-hidden="true" />
                Check
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground sm:mb-5">
          <span>Choose a square, then type or use the on-screen keys.</span>
          {crosswordData && <span className="shrink-0 tabular-nums">{crosswordData.entries.length} clues</span>}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : crosswordData ? (
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)] xl:gap-6">
            <Card className="min-w-0 gap-0 overflow-hidden border-border bg-card shadow-sm">
              <CardContent className="flex justify-center p-2.5 sm:p-4">
                  <div
                    className="grid w-full max-w-[38rem] gap-[clamp(1px,0.3vw,3px)]"
                    style={{ 
                      gridTemplateColumns: `repeat(${crosswordData.dimensions.cols}, minmax(0, 1fr))`
                    }}
                  >
                    {Array(crosswordData.dimensions.rows).fill(null).map((_, rowIndex) => (
                      <React.Fragment key={`row-${rowIndex}`}>
                        {Array(crosswordData.dimensions.cols).fill(null).map((_, colIndex) => {
                          const isCell = isCellInGrid(rowIndex, colIndex);
                          const cellNumber = getCellNumber(rowIndex, colIndex);
                          const isSelected = selectedCell && 
                                            selectedCell.row === rowIndex && 
                                            selectedCell.col === colIndex;
                          const isInWord = isInSelectedWord(rowIndex, colIndex);
                          return (
                            <React.Fragment key={`cell-${rowIndex}-${colIndex}`}>
                              {isCell ? (
                                <button
                                  type="button"
                                  aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}${cellNumber !== null ? `, clue ${cellNumber}` : ""}${userInput[rowIndex]?.[colIndex] ? `, ${userInput[rowIndex][colIndex]}` : ", empty"}`}
                                  aria-pressed={Boolean(isSelected)}
                                  onClick={() => handleCellClick(rowIndex, colIndex)}
                                  className={`
                                    relative flex aspect-square min-w-0 touch-manipulation items-center justify-center rounded-[3px] border text-[clamp(0.55rem,2.8vw,1.2rem)] font-bold leading-none tabular-nums transition-colors duration-150 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                    ${isSelected 
                                      ? 'border-primary bg-primary/30 text-foreground'
                                      : isInWord
                                        ? 'border-primary/50 bg-primary/10 text-foreground'
                                        : 'border-border bg-background text-foreground hover:border-primary/60'
                                    }
                                  `}
                                >
                                  {cellNumber !== null && (
                                    <span className="absolute left-0.5 top-0 text-[clamp(0.38rem,1.4vw,0.58rem)] font-medium leading-none text-muted-foreground">
                                      {cellNumber}
                                    </span>
                                  )}
                                  <span className="pt-0.5">
                                    {userInput[rowIndex]?.[colIndex] || ''}
                                  </span>
                                </button>
                              ) : (
                                <div aria-hidden="true" className="aspect-square min-w-0" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
              </CardContent>
            </Card>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {/* Across Clues */}
              <Card className="min-w-0 gap-0 border-border bg-card shadow-sm">
                <CardHeader className="gap-1 px-4 pb-3 pt-4">
                  <CardTitle className="text-base">Across</CardTitle>
                  <CardDescription>Select a clue to jump to its first square.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-72 space-y-1 overflow-y-auto px-2 pb-3 sm:px-3">
                {crosswordData.entries
                  .filter(entry => entry.direction === 'across')
                  .sort((a, b) => a.number - b.number)
                  .map((entry, i) => (
                    <button
                      type="button"
                      key={`across-${entry.number}-${i}`}
                      className={`
                        flex w-full items-start rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${selectedWord && selectedWord.id === entry.id 
                          ? 'bg-primary/10 text-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      onClick={() => handleClueClick(entry)}
                    >
                      <span className="mr-2 min-w-6 shrink-0 font-semibold tabular-nums text-primary">{entry.number}.</span>
                      <span>{entry.clue}</span>
                    </button>
                  ))
                }
                </CardContent>
              </Card>

              {/* Down Clues */}
              <Card className="min-w-0 gap-0 border-border bg-card shadow-sm">
                <CardHeader className="gap-1 px-4 pb-3 pt-4">
                  <CardTitle className="text-base">Down</CardTitle>
                  <CardDescription>Select a clue to jump to its first square.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-72 space-y-1 overflow-y-auto px-2 pb-3 sm:px-3">
                {crosswordData.entries
                  .filter(entry => entry.direction === 'down')
                  .sort((a, b) => a.number - b.number)
                  .map((entry, i) => (
                    <button
                      type="button"
                      key={`down-${entry.number}-${i}`}
                      className={`
                        flex w-full items-start rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${selectedWord && selectedWord.id === entry.id 
                          ? 'bg-primary/10 text-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      onClick={() => handleClueClick(entry)}
                    >
                      <span className="mr-2 min-w-6 shrink-0 font-semibold tabular-nums text-primary">{entry.number}.</span>
                      <span>{entry.clue}</span>
                    </button>
                  ))
                }
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-400 py-10">
            Failed to load crossword data
          </div>
        )}
      </main>
      {!gameCompleted && <CrosswordKeyboard onKeyPress={handleVirtualKey} />}

      {/* Success Message */}
      {gameCompleted && (
        <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-xl border border-primary/30 bg-card/95 p-4 text-center shadow-xl backdrop-blur sm:inset-x-auto sm:bottom-5">
          <div>
            <h3 className="mb-1 text-lg font-bold text-foreground">Crossword complete</h3>
            <p className="text-sm text-muted-foreground">You finished in {formatTime(timeElapsed)}</p>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeValidationModal}
        >
          <div
            className="bg-white/95 dark:bg-black/90 p-6 rounded-xl border border-purple-500/30 max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Puzzle Progress</h2>
              <button 
                onClick={closeValidationModal} 
                className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Summary Section */}
            <div className="mb-6">
              {validationResults.allCorrect && validationResults.allFilled ? (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                    Perfect!
                  </h3>
                  <p className="text-slate-700 dark:text-gray-300">
                    Congratulations! You've completed the crossword successfully.
                  </p>
                </div>
              ) : (
                <div className="text-lg text-slate-700 dark:text-gray-200 mb-4">
                  <div className="flex gap-8">
                    <div>
                      <span className="text-green-700 dark:text-green-400">{validationResults.correct.length}</span> correct
                    </div>
                    <div>
                      <span className="text-red-700 dark:text-red-400">{validationResults.incorrect.length}</span> incorrect
                    </div>
                    <div>
                      <span className="text-yellow-700 dark:text-yellow-400">{validationResults.empty.length}</span> incomplete
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Only show sections that need attention */}
            <div className="space-y-6">
              {/* Incorrect Answers */}
              {validationResults.incorrect.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 border-b border-red-500/30 pb-1">
                    Need Correction
                  </h3>
                  <div className="space-y-2">
                    {validationResults.incorrect.map((result, idx) => (
                      <div 
                        key={`incorrect-${idx}`} 
                        className="p-3 rounded bg-red-900/20 border border-red-500/20"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium text-red-700 dark:text-red-300">
                            {result.entry.number} {result.entry.direction.charAt(0).toUpperCase() + result.entry.direction.slice(1)}
                          </div>
                          <div>
                            <span className="text-red-700 dark:text-red-400 font-mono">{result.userAnswer}</span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                          {result.entry.clue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty Answers */}
              {validationResults.empty.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-3 border-b border-yellow-500/30 pb-1">
                    Still Incomplete
                  </h3>
                  <div className="space-y-2">
                    {validationResults.empty.map((result, idx) => (
                      <div 
                        key={`empty-${idx}`} 
                        className="p-3 rounded bg-yellow-900/10 border border-yellow-500/20"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium text-yellow-700 dark:text-yellow-300">
                            {result.entry.number} {result.entry.direction.charAt(0).toUpperCase() + result.entry.direction.slice(1)}
                          </div>
                          <div className="text-slate-500 dark:text-gray-400">
                            {result.expected.length} letters
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                          {result.entry.clue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              {!validationResults.allCorrect && (
                <button
                  onClick={closeValidationModal}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {validationResults.empty.length > 0 ? "Keep Going" : "Try Again"}
                </button>
              )}
              {validationResults.allCorrect && validationResults.allFilled && (
                <button
                  onClick={closeValidationModal}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-white/95 dark:bg-black/80 p-6 rounded-xl border border-purple-500/30 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How to Play Crossword</h2>
              <button 
                onClick={() => setShowInstructions(false)} 
                className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-gray-300">
              <p>Fill in the crossword grid with Biblical words based on the clues provided.</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Click/tap on a square to select it</li>
                <li>Type letters to fill in the answers</li>
                <li>Click on clues to navigate to their position</li>
                <li>Use arrow keys to move between cells</li>
                <li>When finished, click "Check" to verify your answers</li>
              </ul>
              <div className="mt-4 bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-purple-800 dark:text-purple-200">
                  Complete the puzzle to earn points and improve your stats!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
