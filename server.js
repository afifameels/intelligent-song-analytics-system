require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const Song = require('./src/models/song');
const { calculateMood, getStreamingReport } = require('./controllers/songController');

const app = express();
connectDB();

async function runSystem() {

    const newSong = {
        id_track: "A101",
        trackName: "Lagu Baru",
        artists: ["Artis Kece"],
        popularity: 85,
        streamEst2025: 2500000,
        audioFeatures: {
            danceability: 0.85,
            valence: 0.75
        }
    };

    newSong.moodTag = calculateMood(
        newSong.audioFeatures.danceability,
        newSong.audioFeatures.valence
    );

    await Song.create(newSong);

    console.log("✅ Fitur Analisis Mood Berhasil:", newSong.moodTag);

    await getStreamingReport();
}

runSystem();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    console.log(`🚀 Server jalan di port ${PORT}`)
);