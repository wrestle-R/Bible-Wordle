"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiBook } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { checkAndClearDailyStorage } from "../utils/storageUtils"
import { getGameState } from "../services/gameStateService"
import { db, auth } from "../firebase.config"
import { doc, getDoc, setDoc } from "firebase/firestore"

const WORD_LENGTH = 5
const MAX_ATTEMPTS = 6

// Add Testament Arrays
const newTestament = [
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
]

const oldTestament = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
]

const BibleCharacterCategory = {
  PROPHETS: "Prophet",
  MINOR_BIBLE_CHARACTER: "Minor Bible Character",
  WARRIOR: "Warrior",
  VILLAINS: "Villain",
  KINGS: "King",
  SYMBOLISM: "Symbol",
  PLACES: "Place",
  EVENTS: "Event",
}

const letterVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  flip: {
    scale: [1, 0, 1],
    rotateX: [0, 90, 0],
    transition: {
      duration: 0.5,
    },
  },
}

const LetterTile = ({ letter, status, delay = 0, isRevealing }) => {
  // Determine tile size based on screen width
  const tileSize =
    window.innerWidth < 400 ? "w-10 h-10 text-xl" : window.innerWidth < 640 ? "w-12 h-12 text-xl" : "w-14 h-14 text-2xl"

  return (
    <motion.div
      variants={letterVariants}
      initial="initial"
      animate={isRevealing ? "flip" : "animate"}
      transition={{ delay }}
      className={`${tileSize} border-2 flex items-center justify-center font-bold rounded
        ${!status && "border-gray-600"}
        ${status === "correct" && "bg-green-500/20 border-green-500"}
        ${status === "present" && "bg-yellow-500/20 border-yellow-500"}
        ${status === "absent" && "bg-gray-800/50 border-gray-600"}
      `}
    >
      {letter}
    </motion.div>
  )
}

const HintButton = ({ onClick, disabled, type, available }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2
      ${
        disabled
          ? "bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700"
          : available
            ? "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500 animate-pulse"
            : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500"
      }
    `}
  >
    <FiBook className="w-3 h-3 sm:w-4 sm:h-4" />
    <span className="truncate">{available ? `${type} Hint!` : `${type}`}</span>
  </motion.button>
)

const HintCard = ({ title, content, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed top-20 inset-x-4 sm:top-20 sm:right-4 sm:left-auto sm:w-72 bg-purple-900/20 backdrop-blur-md p-4 rounded-lg border border-purple-500/30 shadow-xl z-50"
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-purple-300 font-semibold">{title}</h3>
      <button onClick={onClose} className="text-purple-400 hover:text-purple-300 p-1">
        ×
      </button>
    </div>
    <p className="text-purple-200">{content}</p>
  </motion.div>
)

const InstructionModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-black/80 p-4 sm:p-6 rounded-xl border border-purple-500/30 max-w-lg w-full"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">How to Play</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              ×
            </button>
          </div>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base">
            <p>Guess the 5-letter biblical word in 6 tries!</p>
            <div className="space-y-2">
              <p>After each guess, the tiles will show:</p>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 border-2 border-green-500 rounded flex items-center justify-center">
                  A
                </div>
                <span>- Correct letter, correct spot</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 border-2 border-yellow-500 rounded flex items-center justify-center">
                  B
                </div>
                <span>- Correct letter, wrong spot</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800/50 border-2 border-gray-600 rounded flex items-center justify-center">
                  C
                </div>
                <span>- Letter not in word</span>
              </div>
            </div>
            <div className="mt-4 bg-purple-900/20 p-3 sm:p-4 rounded-lg">
              <p className="text-purple-200">Special Hints:</p>
              <ul className="list-disc list-inside text-purple-300 space-y-1 mt-2">
                <li>After 4 attempts - Testament revealed</li>
                <li>After 5 attempts - Category revealed</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

// Add this utility function at the top
const getCurrentDate = () => new Date().toISOString().split('T')[0];

const STORAGE_KEY = 'wordleGameState';

export default function Wordle({ wordData, onGameComplete }) {
  const [attempts, setAttempts] = useState([])
  const [currentAttempt, setCurrentAttempt] = useState("")
  const [gameStatus, setGameStatus] = useState("playing") // 'playing', 'won', 'lost'
  const [showTestament, setShowTestament] = useState(false)
  const [showCategory, setShowCategory] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [showInstructions, setShowInstructions] = useState(() => {
    const hasSeenInstructions = localStorage.getItem("hasSeenInstructions")
    return !hasSeenInstructions
  })
  const [testamentHintAvailable, setTestamentHintAvailable] = useState(false)
  const [categoryHintAvailable, setCategoryHintAvailable] = useState(false)
  const [isFirstGame, setIsFirstGame] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [dailyGameCompleted, setDailyGameCompleted] = useState(false)
  const [localAttempts, setLocalAttempts] = useState(() => {
    const saved = localStorage.getItem('currentAttempts');
    return saved ? JSON.parse(saved) : [];
  });

  // Add new state for saved game
  const [savedGame, setSavedGame] = useState(null);

  // Load saved game state on mount
  useEffect(() => {
    const loadSavedGame = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const gameState = JSON.parse(saved);
        const today = getCurrentDate();
        
        // Only restore if it's from today
        if (gameState.date === today) {
          console.log("Loading saved game from today:", gameState);
          setAttempts(gameState.attempts || []);
          setGameStatus(gameState.status || 'playing');
          setSavedGame(gameState);
          
          // If game was completed, set appropriate flags
          if (gameState.status !== 'playing') {
            setDailyGameCompleted(true);
            setHasPlayedToday(true);
          }
        } else {
          console.log("Found old saved game, clearing...");
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };

    loadSavedGame();
  }, []);

  // Save game state after each attempt
  useEffect(() => {
    const saveGameState = () => {
      const gameState = {
        date: getCurrentDate(),
        attempts,
        status: gameStatus,
        word: wordData.name
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      console.log("Saved game state:", gameState);
    };

    if (attempts.length > 0) {
      saveGameState();
    }
  }, [attempts, gameStatus, wordData.name]);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    // Check and clear storage if it's a new day
    checkAndClearDailyStorage()

    // Then check instructions flag
    const hasSeenInstructions = localStorage.getItem("hasSeenInstructions")
    setShowInstructions(!hasSeenInstructions)
  }, [])

  useEffect(() => {
    if (!showInstructions) {
      localStorage.setItem("hasSeenInstructions", "true")
    }
  }, [showInstructions])

  useEffect(() => {
    // Log the daily word for development
    console.log("Today's word:", wordData.name)
  }, [wordData])

  useEffect(() => {
    const gameState = getGameState()
    if (gameState?.completed) {
      setIsFirstGame(false)
    }
  }, [])

  // Modify checkDailyPlay to handle saved state
  useEffect(() => {
    const checkDailyPlay = async () => {
      if (!auth.currentUser) return;

      const today = getCurrentDate();
      const dailyPlayRef = doc(db, 'dailyPlays', auth.currentUser.uid);
      
      try {
        const docSnap = await getDoc(dailyPlayRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.lastPlayed === today) {
            console.log("Found today's play in Firebase");
            setHasPlayedToday(true);
            setDailyGameCompleted(true);
            
            // Load saved state if exists
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
              const state = JSON.parse(savedState);
              if (state.date === today) {
                console.log("Restoring saved game state");
                setAttempts(state.attempts);
                setGameStatus(state.status);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking daily play:", error);
      }
    };

    checkDailyPlay();
  }, []);

  // Save attempts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('currentAttempts', JSON.stringify(attempts));
  }, [attempts]);

  // Modify updateDailyPlay to check dates properly
  const updateDailyPlay = async (gameResult) => {
    if (!auth.currentUser) {
      console.log("No auth user - skipping Firebase update");
      return false;
    }

    const today = getCurrentDate();
    const dailyPlayRef = doc(db, 'dailyPlays', auth.currentUser.uid);

    try {
      const docSnap = await getDoc(dailyPlayRef);
      const existingData = docSnap.exists() ? docSnap.data() : null;

      // Check if already played today
      if (existingData && existingData.lastPlayed === today) {
        console.log("Already played today - preventing update");
        return false;
      }

      // Update with new game result
      await setDoc(dailyPlayRef, {
        lastPlayed: today,
        result: gameResult,
        attempts,
        timestamp: new Date().toISOString()
      });
      
      console.log("Daily play updated in Firebase:", gameResult);
      setHasPlayedToday(true);
      setDailyGameCompleted(true);
      return true;
    } catch (error) {
      console.error("Error updating daily play:", error);
      return false;
    }
  };

  const toggleHint = (type) => {
    if (type === "testament") {
      setShowCategory(false) // Close category if open
      setShowTestament((prev) => !prev)
    } else {
      setShowTestament(false) // Close testament if open
      setShowCategory((prev) => !prev)
    }
  }

  const checkWord = async (word) => {
    const statuses = []
    const wordArray = wordData.name.toUpperCase().split("")
    const attempArray = word.toUpperCase().split("")

    // First pass: mark correct letters
    attempArray.forEach((letter, i) => {
      if (letter === wordArray[i]) {
        statuses[i] = "correct"
        wordArray[i] = null
      }
    })

    // Second pass: mark present letters
    attempArray.forEach((letter, i) => {
      if (statuses[i]) return

      const index = wordArray.indexOf(letter)
      if (index !== -1) {
        statuses[i] = "present"
        wordArray[index] = null
      } else {
        statuses[i] = "absent"
      }
    })

    return statuses
  }

  const handleKeydown = async (e) => {
    if (gameStatus !== "playing") return
    if (isRevealing) return

    if (e.key === "Backspace") {
      setCurrentAttempt((prev) => prev.slice(0, -1))
    } else if (e.key === "Enter" && currentAttempt.length === WORD_LENGTH) {
      // Check if max attempts reached or already completed
      if (hasPlayedToday && attempts.length >= MAX_ATTEMPTS) {
        console.log("Max attempts reached or already played today")
        return
      }

      setIsRevealing(true)
      const statuses = await checkWord(currentAttempt)

      const newAttempts = [...attempts, { word: currentAttempt, statuses }]
      setAttempts(newAttempts)
      setCurrentAttempt("")

      // Check win/loss conditions
      if (statuses.every((s) => s === "correct")) {
        setGameStatus("won")
        handleGameComplete({
          won: true,
          attempts: newAttempts.length,
        })
        toast.success("Congratulations! You won! 🎉")
      } else if (newAttempts.length >= MAX_ATTEMPTS) {
        setGameStatus("lost")
        handleGameComplete({
          won: false,
          attempts: MAX_ATTEMPTS,
        })
        toast.error(`Game Over! The word was ${wordData.name.toUpperCase()}`)
      }

      // Silently enable hints based on attempts
      if (newAttempts.length === 4) {
        setCategoryHintAvailable(true)
      }
      if (newAttempts.length === 5) {
        setTestamentHintAvailable(true)
      }

      setTimeout(() => setIsRevealing(false), 1500)
    } else if (/^[A-Za-z]$/.test(e.key) && currentAttempt.length < WORD_LENGTH) {
      setCurrentAttempt((prev) => prev + e.key.toUpperCase())
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown)
    return () => window.removeEventListener("keydown", handleKeydown)
  }, [currentAttempt, gameStatus, isRevealing])

  const renderGameGrid = () => {
    const rows = []

    // Render previous attempts
    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i]
      rows.push(
        <div key={i} className="flex gap-1 sm:gap-2 justify-center">
          {attempt.word.split("").map((letter, j) => (
            <LetterTile
              key={j}
              letter={letter}
              status={attempt.statuses[j]}
              delay={j * 0.2}
              isRevealing={isRevealing && i === attempts.length - 1}
            />
          ))}
        </div>,
      )
    }

    // Render current attempt
    if (attempts.length < MAX_ATTEMPTS) {
      rows.push(
        <div key="current" className="flex gap-1 sm:gap-2 justify-center">
          {Array(WORD_LENGTH)
            .fill(0)
            .map((_, i) => (
              <LetterTile key={i} letter={currentAttempt[i] || ""} status={null} />
            ))}
        </div>,
      )
    }

    // Fill remaining rows
    for (let i = rows.length; i < MAX_ATTEMPTS; i++) {
      rows.push(
        <div key={i} className="flex gap-1 sm:gap-2 justify-center">
          {Array(WORD_LENGTH)
            .fill(0)
            .map((_, j) => (
              <LetterTile key={j} letter="" status={null} />
            ))}
        </div>,
      )
    }

    return rows
  }

  const getTestamentContent = () => {
    const book = wordData.verse_location.split(" ")[0]
    return `This word is from the ${newTestament.includes(book) ? "New" : "Old"} Testament`
  }

  const formatCategory = (category) => {
    return (
      BibleCharacterCategory[
        Object.keys(BibleCharacterCategory).find(
          (key) => BibleCharacterCategory[key].toLowerCase() === category.toLowerCase(),
        )
      ] || category
    )
  }

  const handleGameComplete = async (result) => {
    console.log("Game completed:", result)
    console.log("Daily game completed:", dailyGameCompleted)
    console.log("Has played today:", hasPlayedToday)

    if (!hasPlayedToday && auth.currentUser) {
      const updated = await updateDailyPlay(result)
      if (updated) {
        console.log("Stats will be updated - first play of the day")
        onGameComplete?.(result)
      }
    } else {
      console.log("Practice mode - stats won't be updated")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col items-center gap-6 sm:gap-8">
        <InstructionModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

        <div className="flex justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <HintButton
            type="Category"
            onClick={() => toggleHint("category")}
            disabled={attempts.length < 4}
            available={categoryHintAvailable && !showCategory}
          />
          <HintButton
            type="Testament"
            onClick={() => toggleHint("testament")}
            disabled={attempts.length < 5}
            available={testamentHintAvailable && !showTestament}
          />
        </div>

        <AnimatePresence>
          {showTestament && (
            <HintCard title="Testament Hint" content={getTestamentContent()} onClose={() => setShowTestament(false)} />
          )}
          {showCategory && (
            <HintCard
              title="Category Hint"
              content={`Category: ${formatCategory(wordData.category)}`}
              onClose={() => setShowCategory(false)}
            />
          )}
        </AnimatePresence>

        {(hasPlayedToday || !auth.currentUser) && (
          <div className="bg-purple-900/20 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-purple-300 text-xs sm:text-sm">
            <span>Practice Mode - Progress won't be saved</span>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:gap-3 scale-100 sm:scale-110 mb-6 sm:mb-8">{renderGameGrid()}</div>

        {gameStatus !== "playing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-900/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-purple-500/30 max-w-2xl w-full"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {gameStatus === "won" ? "🎉 Excellent Work!" : "📖 Learning Opportunity"}
            </h3>
            <p className="text-purple-200 mb-4">
              The word was <span className="text-purple-400 font-bold">{wordData.name.toUpperCase()}</span>
            </p>
            <div className="space-y-3 text-gray-300 text-sm sm:text-base">
              <p className="flex gap-2 items-start">
                <FiBook className="mt-1 text-purple-400" />
                <span>
                  <strong className="text-purple-300">Scripture:</strong> {wordData.verse_location}
                </span>
              </p>
              <p className="text-purple-200">{wordData.description}</p>
              <p className="text-purple-100 bg-purple-500/10 p-3 rounded border border-purple-500/20">
                <strong className="text-purple-300">Biblical Moment:</strong> {wordData.special_moment}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
