const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    id_artist: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    totalStreamEst: { type: Number, default: 0 },
    genres: [String]
});

module.exports = mongoose.model('Artist', artistSchema);