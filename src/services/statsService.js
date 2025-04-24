import { db } from '../firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const defaultStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayed: null,
  winPercentage: 0,
  averageMoves: 0,
  totalMoves: 0,
  distribution: {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
  }
};

export const initializeUserStats = async (userId) => {
  if (!userId) return defaultStats;

  const userRef = doc(db, 'users', userId);
  try {
    console.log('Fetching stats for user:', userId);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      console.log('No stats found, creating default stats');
      await setDoc(userRef, defaultStats);
      return defaultStats;
    }
    
    const stats = docSnap.data();
    console.log('Retrieved stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return defaultStats;
  }
};

export const updateGameStats = async (userId, gameResult) => {
  if (!userId) return null;

  const userRef = doc(db, 'users', userId);
  try {
    console.log('Updating stats for user:', userId);
    console.log('Game result:', gameResult);
    
    const docSnap = await getDoc(userRef);
    const currentStats = docSnap.exists() ? docSnap.data() : defaultStats;
    
    console.log('Current stats:', currentStats);
    
    const today = new Date().toDateString();
    const isNewDay = currentStats.lastPlayed !== today;
    const { won, attempts } = gameResult;

    const newStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      gamesWon: currentStats.gamesWon + (won ? 1 : 0),
      currentStreak: won ? (isNewDay ? currentStats.currentStreak + 1 : currentStats.currentStreak) : 0,
      lastPlayed: today,
      totalMoves: currentStats.totalMoves + attempts,
      distribution: {
        ...currentStats.distribution,
        [attempts]: currentStats.distribution[attempts] + (won ? 1 : 0)
      }
    };

    // Calculate derived stats
    newStats.winPercentage = Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100);
    newStats.averageMoves = Math.round((newStats.totalMoves / newStats.gamesPlayed) * 10) / 10;
    newStats.maxStreak = Math.max(currentStats.maxStreak || 0, newStats.currentStreak);

    console.log('New stats to be saved:', newStats);
    await setDoc(userRef, newStats);
    return newStats;
  } catch (error) {
    console.error('Error updating stats:', error);
    return null;
  }
};
