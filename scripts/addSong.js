const connectDB = require('../config/db');
const Song = require('../models/Song');

const addSong = async () => {
    try {
        await connectDB();
        
        const song = new Song({
            title: 'We Rollin',
            artist: 'Shubh',
            filePath: '/Songs/We Rollin.mp3', // Corrected path to match the public directory
            duration: '3:42'
        });

        await song.save();
        console.log('Song added successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error adding song:', error);
        process.exit(1);
    }
};

addSong();
