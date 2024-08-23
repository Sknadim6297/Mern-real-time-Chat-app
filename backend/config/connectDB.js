const mongoose = require('mongoose');

// Establish connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database connected successfully");
}).catch((error) => {
    console.log("Error while connecting to database", error.message);
});

// Export mongoose for use elsewhere
module.exports = mongoose;
