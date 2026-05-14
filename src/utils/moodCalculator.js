const calculateMood = (danceability, valence) => {
    if (valence > 0.7 && danceability > 0.7) return 'Happy';
    if (valence < 0.3) return 'Sad';
    if (danceability > 0.8) return 'Energetic';
    return 'Chill';
};

module.exports = calculateMood;