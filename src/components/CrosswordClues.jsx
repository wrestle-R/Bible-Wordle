import React from 'react';
import { motion } from 'framer-motion';

export default function CrosswordClues({ words, selectedClue, onClueClick }) {
  if (!words || words.length === 0) return null;
  
  // Separate words into across and down clues
  const acrossClues = words.filter(word => word.direction === 'across')
    .sort((a, b) => a.number - b.number);
    
  const downClues = words.filter(word => word.direction === 'down')
    .sort((a, b) => a.number - b.number);

  const renderClue = (clue, index) => {
    const isSelected = selectedClue && 
      selectedClue.direction === clue.direction && 
      selectedClue.number === clue.number;
      
    return (
      <motion.div 
        key={`${clue.direction}-${clue.number}-${index}`}
        whileHover={{ x: 4 }}
        className={`
          px-3 py-2 rounded cursor-pointer mb-1
          ${isSelected ? 'bg-purple-500/20 border-l-4 border-purple-400' : 'hover:bg-purple-900/20'}
        `}
        onClick={() => onClueClick(clue)}
      >
        <span className="font-medium text-purple-300 mr-2">{clue.number}.</span>
        <span className="text-gray-100">{clue.clue}</span>
      </motion.div>
    );
  };

  return (
    <div className="bg-black/30 rounded-lg border border-purple-500/20 p-4 h-full overflow-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-600/30 pb-2 mb-2">
          Across
        </h3>
        {acrossClues.map((clue, index) => renderClue(clue, index))}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-600/30 pb-2 mb-2">
          Down
        </h3>
        {downClues.map((clue, index) => renderClue(clue, index))}
      </div>
    </div>
  );
}
