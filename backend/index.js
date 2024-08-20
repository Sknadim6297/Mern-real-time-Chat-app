const express = require('express')
const cors = require('cors')
require('dotenv').config()
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app, server } = require('./socket/index')
const mongoConnection = require('./config/connectDB')


const allowedOrigins = ['*'];
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

app.use(express.json())
app.use(cookiesParser())

const PORT = process.env.PORT || 4000

app.get('/',(request,response)=>{
    response.json({
        message : "Server running at " + PORT
    })
})

//api endpoints
app.use('/api',router)
mongoConnection.then(()=>{
    server.listen(PORT,()=>{
        console.log("server running at " + PORT)
    })
})
