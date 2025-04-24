export const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

export const getGameState = () => {
  const state = localStorage.getItem('gameState');
  if (!state) return null;

  const { date, completed } = JSON.parse(state);
  if (date !== getTodayKey()) return null;
  
  return { completed };
};

export const setGameCompleted = (result) => {
  const todayKey = getTodayKey();
  localStorage.setItem('gameState', JSON.stringify({
    date: todayKey,
    completed: true,
    ...result
  }));
};
