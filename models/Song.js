const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    duration: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    playCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Song', songSchema);
