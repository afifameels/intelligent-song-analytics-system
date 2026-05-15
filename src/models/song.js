const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({

    id_track: String,

    track_name: String,

    album_name: String,

    artist_names: [String],

    popularity: Number,

    genres: String,

    record_label: String,

    danceability: Number,

    energy: Number,

    valence: Number,

    tempo: Number,

    estimated_streams_2025: Number

});

module.exports = mongoose.model('Song', songSchema);