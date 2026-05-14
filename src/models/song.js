const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    // 1. Identitas Lagu (Katalog) -
    id_track: { type: String, required: true, unique: true }, 
    trackName: { type: String, required: true }, 
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    artists: [{ type: String }], // Array untuk mendukung $unwind
    releaseDate: { type: Date }, 
    
    // 2. Metrik & Statistik -
    duration_ms: { type: Number },
    popularity: { type: Number, min: 0, max: 100 }, 
    explicit: { type: Boolean, default: false },
    genres: [{ type: String }], // Array untuk multi-genre
    recordLabel: { type: String }, 
    streamEst2025: { type: Number }, 
    
    // 3. Audio Features (Strategi Embedded) -
    audioFeatures: {
        danceability: { type: Number }, // Dasar filter Mood
        energy: { type: Number },
        key: { type: Number },
        loudness: { type: Number },
        mode: { type: Number },
        speechiness: { type: Number },
        acousticness: { type: Number },
        instrumentalness: { type: Number },
        liveness: { type: Number },
        valence: { type: Number }, // Dasar filter Mood
        tempo: { type: Number },
        timeSignature: { type: Number }
    },
    
    // 4. Analisis Server-side -
    moodTag: { 
        type: String, 
        enum: ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic'] 
    }
}, { 
    timestamps: true // Menghasilkan createdAt & updatedAt otomatis
});

// --- STRATEGI INDEXING (Berdasarkan Bab 5 di Paper) ---

// Text Index untuk fitur Dynamic Search & Autocomplete
songSchema.index({ trackName: 'text' }); 

// Index untuk filter ranking & sort descending
songSchema.index({ popularity: -1 }); 

// Index untuk sorting Top Songs 2025
songSchema.index({ streamEst2025: -1 });

module.exports = mongoose.model('Song', songSchema);