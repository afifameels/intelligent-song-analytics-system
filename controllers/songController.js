const Song = require('../src/models/song');

// 1. Fitur Analisis Mood Otomatis
exports.calculateMood = (danceability, valence) => {
    if (valence > 0.7 && danceability > 0.7) return 'Happy';
    if (valence < 0.3) return 'Sad';
    if (danceability > 0.8) return 'Energetic';
    return 'Chill';
};

// 2. Fitur Agregasi Laporan (Virtual View)
exports.getStreamingReport = async (req, res) => {
    try {
        const report = await Song.aggregate([
            { $unwind: "$artists" },
            { $sort: { streamEst2025: -1 } },
            { $limit: 10 }
        ]);
        console.log("📊 Laporan Top 10 Streaming Berhasil Dibuat");
        return report;
    } catch (err) {
        console.error(err);
    }
};