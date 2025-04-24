// Get a deterministic word based on the date
const overrides = {
  [new Date().toISOString().split('T')[0]]: {
    name: "JESUS",
    verse_location: "Matthew 1:21",
    description: "The Messiah, Son of God",
    category: "prophets",
    special_moment: "Born in Bethlehem to save people from their sins, died on the cross and rose again for our salvation."
  }
};

export const getDailyWord = (words) => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Check for moderator override
  if (overrides[dateString]) {
    console.log('Using moderator override for:', dateString);
    return overrides[dateString];
  }

  // Default word selection logic
  const startDate = new Date('2024-01-01').getTime();
  const day = Math.floor((today.getTime() - startDate) / (1000 * 60 * 60 * 24));
  const index = day % words.length;
  return words[index];
};

// Add function to set moderator override
export const setDailyWordOverride = (date, word) => {
  if (!word || !word.name || !word.verse_location) {
    throw new Error('Invalid word object provided for override');
  }
  overrides[date] = word;
};
