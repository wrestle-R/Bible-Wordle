// Get a deterministic word based on the date
export const getDailyWord = (words) => {
  const today = new Date();
  const startDate = new Date('2024-01-01').getTime(); // Use your desired start date
  const day = Math.floor((today.getTime() - startDate) / (1000 * 60 * 60 * 24));
  const index = day % words.length;
  return words[index];
};
