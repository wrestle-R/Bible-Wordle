const todayStr = new Date().toISOString().split('T')[0]; // e.g., "2025-04-26"

const overrides = {
  [todayStr]: {
    name: "JUDAS",
    verse_location: "Matthew 26:14",
    description: "Jesus' betrayer",
    category: "villains",
    special_moment: "Judas betrayed Christ with a kiss for thirty silver coins, then hanged himself in remorse."
  }
};

export const getDailyWord = (words) => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  if (overrides[dateString]) {
    console.log('Using moderator override for:', dateString);
    return overrides[dateString];
  }

  const startDate = new Date('2024-01-01').getTime();
  const day = Math.floor((today.getTime() - startDate) / (1000 * 60 * 60 * 24));
  const index = day % words.length;
  return words[index];
};

export const setDailyWordOverride = (date, word) => {
  if (!word || !word.name || !word.verse_location) {
    throw new Error('Invalid word object provided for override');
  }
  overrides[date] = word;
};
