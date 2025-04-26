export const getDailyWord = (words) => {
  const today = new Date();
  const startDate = new Date('2025-04-26').getTime();
  const day = Math.floor((today.getTime() - startDate) / (1000 * 60 * 60 * 24));
  const index = day % words.length;

  // For debugging
  console.log(`Days since start: ${day}`);
  console.log(`Word index: ${index}`);
  
  return words[index];
};