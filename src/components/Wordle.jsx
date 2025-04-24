import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHelpCircle, FiInfo, FiBook } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { checkAndClearDailyStorage } from '../utils/storageUtils';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

// Add Testament Arrays
const newTestament = [
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation"
];

const oldTestament = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi"
];

const BibleCharacterCategory = {
  PROPHETS: "Prophet",
  MINOR_BIBLE_CHARACTER: "Minor Bible Character",
  WARRIOR: "Warrior",
  VILLAINS: "Villain",
  KINGS: "King",
  SYMBOLISM: "Symbol",
  PLACES: "Place",
  EVENTS: "Event"
};

const letterVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  flip: {
    scale: [1, 0, 1],
    rotateX: [0, 90, 0],
    transition: {
      duration: 0.5
    }
  }
};

const LetterTile = ({ letter, status, delay = 0, isRevealing }) => (
  <motion.div
    variants={letterVariants}
    initial="initial"
    animate={isRevealing ? "flip" : "animate"}
    transition={{ delay }}
    className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded
      ${!status && 'border-gray-600'}
      ${status === 'correct' && 'bg-green-500/20 border-green-500'}
      ${status === 'present' && 'bg-yellow-500/20 border-yellow-500'}
      ${status === 'absent' && 'bg-gray-800/50 border-gray-600'}
    `}
  >
    {letter}
  </motion.div>
);

const HintButton = ({ onClick, disabled, type, available }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
      ${disabled 
        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700' 
        : available 
          ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500 animate-pulse'
          : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500'
      }
    `}
  >
    <FiBook className="w-4 h-4" />
    {available ? `${type} Hint Available!` : `Reveal ${type}`}
  </motion.button>
);

const HintCard = ({ title, content, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed top-20 right-4 w-72 bg-purple-900/20 backdrop-blur-md p-4 rounded-lg border border-purple-500/30 shadow-xl z-50"
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-purple-300 font-semibold">{title}</h3>
      <button 
        onClick={onClose}
        className="text-purple-400 hover:text-purple-300 p-1"
      >
        ×
      </button>
    </div>
    <p className="text-purple-200">{content}</p>
  </motion.div>
);

const InstructionModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-black/80 p-6 rounded-xl border border-purple-500/30 max-w-lg w-full mx-4"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">How to Play</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>Guess the 5-letter biblical word in 6 tries!</p>
            <div className="space-y-2">
              <p>After each guess, the tiles will show:</p>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-green-500/20 border-2 border-green-500 rounded flex items-center justify-center">A</div>
                <span>- Correct letter, correct spot</span>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-yellow-500/20 border-2 border-yellow-500 rounded flex items-center justify-center">B</div>
                <span>- Correct letter, wrong spot</span>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-gray-800/50 border-2 border-gray-600 rounded flex items-center justify-center">C</div>
                <span>- Letter not in word</span>
              </div>
            </div>
            <div className="mt-4 bg-purple-900/20 p-4 rounded-lg">
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
);

export default function Wordle({ wordData, onGameComplete }) {
  const [attempts, setAttempts] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [showTestament, setShowTestament] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(() => {
    const hasSeenInstructions = localStorage.getItem('hasSeenInstructions');
    return !hasSeenInstructions;
  });
  const [testamentHintAvailable, setTestamentHintAvailable] = useState(false);
  const [categoryHintAvailable, setCategoryHintAvailable] = useState(false);

  useEffect(() => {
    // Check and clear storage if it's a new day
    checkAndClearDailyStorage();
    
    // Then check instructions flag
    const hasSeenInstructions = localStorage.getItem('hasSeenInstructions');
    setShowInstructions(!hasSeenInstructions);
  }, []);

  useEffect(() => {
    if (!showInstructions) {
      localStorage.setItem('hasSeenInstructions', 'true');
    }
  }, [showInstructions]);

  useEffect(() => {
    // Log the daily word for development
    console.log('Today\'s word:', wordData.name);
  }, [wordData]);

  const toggleHint = (type) => {
    if (type === 'testament') {
      setShowCategory(false); // Close category if open
      setShowTestament(prev => !prev);
    } else {
      setShowTestament(false); // Close testament if open
      setShowCategory(prev => !prev);
    }
  };

  const checkWord = async (word) => {
    const statuses = [];
    const wordArray = wordData.name.toUpperCase().split('');
    const attempArray = word.toUpperCase().split('');

    // First pass: mark correct letters
    attempArray.forEach((letter, i) => {
      if (letter === wordArray[i]) {
        statuses[i] = 'correct';
        wordArray[i] = null;
      }
    });

    // Second pass: mark present letters
    attempArray.forEach((letter, i) => {
      if (statuses[i]) return;
      
      const index = wordArray.indexOf(letter);
      if (index !== -1) {
        statuses[i] = 'present';
        wordArray[index] = null;
      } else {
        statuses[i] = 'absent';
      }
    });

    return statuses;
  };

  const handleKeydown = async (e) => {
    if (gameStatus !== 'playing') return;
    if (isRevealing) return;

    if (e.key === 'Backspace') {
      setCurrentAttempt(prev => prev.slice(0, -1));
    } else if (e.key === 'Enter' && currentAttempt.length === WORD_LENGTH) {
      setIsRevealing(true);
      const statuses = await checkWord(currentAttempt);
      
      const newAttempts = [...attempts, { word: currentAttempt, statuses }];
      setAttempts(newAttempts);
      setCurrentAttempt('');

      // Check win/loss conditions
      if (statuses.every(s => s === 'correct')) {
        setGameStatus('won');
        toast.success('Congratulations! You won! 🎉');
        onGameComplete?.(); // Call callback when game ends
      } else if (newAttempts.length >= MAX_ATTEMPTS) {
        setGameStatus('lost');
        toast.error(`Game Over! The word was ${wordData.name.toUpperCase()}`);
        onGameComplete?.(); // Call callback when game ends
      }

      // Silently enable hints based on attempts
      if (newAttempts.length === 4) {
        setCategoryHintAvailable(true);
      }
      if (newAttempts.length === 5) {
        setTestamentHintAvailable(true);
      }

      setTimeout(() => setIsRevealing(false), 1500);
    } else if (/^[A-Za-z]$/.test(e.key) && currentAttempt.length < WORD_LENGTH) {
      setCurrentAttempt(prev => prev + e.key.toUpperCase());
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentAttempt, gameStatus, isRevealing]);

  const renderGameGrid = () => {
    const rows = [];
    
    // Render previous attempts
    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      rows.push(
        <div key={i} className="flex gap-2">
          {attempt.word.split('').map((letter, j) => (
            <LetterTile
              key={j}
              letter={letter}
              status={attempt.statuses[j]}
              delay={j * 0.2}
              isRevealing={isRevealing && i === attempts.length - 1}
            />
          ))}
        </div>
      );
    }

    // Render current attempt
    if (attempts.length < MAX_ATTEMPTS) {
      rows.push(
        <div key="current" className="flex gap-2">
          {Array(WORD_LENGTH).fill(0).map((_, i) => (
            <LetterTile
              key={i}
              letter={currentAttempt[i] || ''}
              status={null}
            />
          ))}
        </div>
      );
    }

    // Fill remaining rows
    for (let i = rows.length; i < MAX_ATTEMPTS; i++) {
      rows.push(
        <div key={i} className="flex gap-2">
          {Array(WORD_LENGTH).fill(0).map((_, j) => (
            <LetterTile key={j} letter="" status={null} />
          ))}
        </div>
      );
    }

    return rows;
  };

  const getTestamentContent = () => {
    const book = wordData.verse_location.split(' ')[0];
    return `This word is from the ${newTestament.includes(book) ? 'New' : 'Old'} Testament`;
  };

  const formatCategory = (category) => {
    return BibleCharacterCategory[
      Object.keys(BibleCharacterCategory).find(
        key => BibleCharacterCategory[key].toLowerCase() === category.toLowerCase()
      )
    ] || category;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex flex-col items-center gap-8">
        <InstructionModal 
          isOpen={showInstructions} 
          onClose={() => setShowInstructions(false)} 
        />
        
        <div className="flex justify-center gap-4 mb-4">
          <HintButton
            type="Category"
            onClick={() => toggleHint('category')}
            disabled={attempts.length < 4}
            available={categoryHintAvailable && !showCategory}
          />
          <HintButton
            type="Testament"
            onClick={() => toggleHint('testament')}
            disabled={attempts.length < 5}
            available={testamentHintAvailable && !showTestament}
          />
        </div>

        <AnimatePresence>
          {showTestament && (
            <HintCard
              title="Testament Hint"
              content={getTestamentContent()}
              onClose={() => setShowTestament(false)}
            />
          )}
          {showCategory && (
            <HintCard
              title="Category Hint"
              content={`Category: ${formatCategory(wordData.category)}`}
              onClose={() => setShowCategory(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 scale-110 mb-8">
          {renderGameGrid()}
        </div>

        {gameStatus !== 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-900/10 backdrop-blur-sm p-6 rounded-lg border border-purple-500/30 max-w-2xl w-full"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              {gameStatus === 'won' ? '🎉 Excellent Work!' : '📖 Learning Opportunity'}
            </h3>
            <p className="text-purple-200 mb-4">
              The word was <span className="text-purple-400 font-bold">{wordData.name.toUpperCase()}</span>
            </p>
            <div className="space-y-3 text-gray-300">
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
  );
}

