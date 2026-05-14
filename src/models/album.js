const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    id_album: { type: String, required: true, unique: true },
    albumName: { type: String, required: true },
    releaseYear: { type: Number },
    label: { type: mongoose.Schema.Types.ObjectId, ref: 'Label' },
    totalTracks: { type: Number },
    albumType: { type: String, enum: ['Single', 'Album', 'EP'] }
}, { timestamps: true });

albumSchema.index({ albumName: 'text' });

module.exports = mongoose.model('Album', albumSchema);