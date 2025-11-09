const mongoose = require('mongoose');

// Connect to MongoDB function
const connectDB = async (uri)  => {
    mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
};

module.exports = connectDB;