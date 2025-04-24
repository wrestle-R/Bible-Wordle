export const checkAndClearDailyStorage = () => {
  const lastPlayed = localStorage.getItem('lastPlayedTimestamp');
  const now = new Date().getTime();
  const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  // Either no timestamp exists or it's been more than 6 hours
  if (!lastPlayed || (now - parseInt(lastPlayed)) > sixHoursInMs) {
    console.log('Clearing storage - 6 hour window expired');
    
    // Clear ALL game-related storage
    localStorage.removeItem('hasSeenInstructions');
    localStorage.removeItem('gameState');
    localStorage.removeItem('currentAttempts');
    localStorage.removeItem('wordleGameState');
    
    // Set new timestamp
    localStorage.setItem('lastPlayedTimestamp', now.toString());
  }
};

// Add function to prevent console cheating
export const obfuscateGameData = (word) => {
  const encoded = btoa(word.toLowerCase());
  return encoded.split('').reverse().join('');
};
