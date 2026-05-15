const express = require('express');
const router = express.Router();

const Song = require('../src/models/song');


// GET ALL SONGS

router.get('/songs', async (req, res) => {

    const songs = await Song.find();

    res.json(songs);
});


// ADD SONG

router.post('/songs', async (req, res) => {

    try {

        console.log(req.body);

        const newSong = new Song(req.body);

        await newSong.save();

        res.status(201).json(newSong);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });
    }
});

// DELETE SONG

router.delete('/songs/:id', async (req, res) => {

    await Song.findByIdAndDelete(req.params.id);

    res.json({
        message:'Song deleted'
    });
});


// UPDATE SONG

router.put('/songs/:id', async (req, res) => {

    const updated = await Song.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new:true }
    );

    res.json(updated);
});


// TOP SONGS

router.get('/top-songs', async (req, res) => {

    const songs = await Song.find()
    .sort({ est_streams_2025:-1 })
    .limit(5);

    res.json(songs);
});

module.exports = router;