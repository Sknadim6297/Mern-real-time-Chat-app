
const mongoose = require('mongoose');

const mongoConnection = mongoose.connect(process.env.MONGODB_URI, ).then(()=>{
    console.log("Database connected successfully")
}).catch((error)=>{
    console.log("Error while connecting to database",error.message)
})


module.exports = mongoConnection