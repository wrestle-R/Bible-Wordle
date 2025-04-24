export const checkAndClearDailyStorage = () => {
  const lastPlayed = localStorage.getItem('lastPlayedDate');
  const today = new Date().toDateString();

  if (lastPlayed !== today) {
    // Clear ALL game-related storage
    localStorage.removeItem('hasSeenInstructions');
    localStorage.removeItem('gameState');
    localStorage.removeItem('currentAttempts');
    
    // Set new last played date
    localStorage.setItem('lastPlayedDate', today);
  }
};

// Add function to prevent console cheating
export const obfuscateGameData = (word) => {
  const encoded = btoa(word.toLowerCase());
  return encoded.split('').reverse().join('');
};
