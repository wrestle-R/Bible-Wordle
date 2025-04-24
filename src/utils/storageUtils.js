export const checkAndClearDailyStorage = () => {
  const lastPlayed = localStorage.getItem('lastPlayedDate');
  const today = new Date().toDateString();

  if (lastPlayed !== today) {
    // Clear game-related storage
    localStorage.removeItem('hasSeenInstructions');
    // Add any other game-related items to clear here
    
    // Set new last played date
    localStorage.setItem('lastPlayedDate', today);
  }
};
