import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCornerDownRight } from 'react-icons/fi';

export default function CrosswordKeyboard({ onKeyPress }) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['SPACE', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const handleKeyPress = (key) => {
    console.log("Key pressed:", key); // Add debugging
    if (key === 'SPACE') {
      onKeyPress('SPACE');
    } else if (key === 'BACKSPACE') {
      onKeyPress('BACKSPACE');
    } else if (key === 'ENTER') {
      onKeyPress('ENTER');
    } else {
      onKeyPress(key);
    }
  };

  const renderKey = (key) => {
    let content = key;
    let className = 'text-sm sm:text-base font-medium rounded-md px-2 py-3 sm:px-3 sm:py-4 min-w-[30px] sm:min-w-[36px] bg-gray-600 text-white active:bg-gray-700 touch-manipulation';

    // Special keys
    if (key === 'BACKSPACE') {
      content = <FiArrowLeft />;
      className += ' min-w-[50px]';
    } else if (key === 'ENTER') {
      content = <FiCornerDownRight />;
      className += ' min-w-[50px]';
    } else if (key === 'SPACE') {
      content = <FiArrowRight />;
      className += ' min-w-[50px]';
    }

    return (
      <motion.button
        key={key}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleKeyPress(key)}
        className={className}
      >
        {content}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 w-full bg-black/80 backdrop-filter backdrop-blur-sm pt-4 pb-5 px-1 border-t border-gray-800 z-40"
    >
      <div className="w-full max-w-md mx-auto flex flex-col gap-1.5">
        <div className="flex justify-center mb-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleKeyPress('ENTER')}
            className="px-4 py-3 bg-purple-600/60 text-white rounded-md min-w-[100px] text-center"
          >
            Check
          </motion.button>
        </div>
        
        {rows.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 mb-1.5">
            {row.map(key => renderKey(key))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
