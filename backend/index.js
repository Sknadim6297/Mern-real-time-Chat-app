const express = require('express')
const cors = require('cors')
require('dotenv').config()
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app, server } = require('./socket/index')
const mongoConnection = require('./config/connectDB')


<<<<<<< HEAD
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }));

  
=======
const allowedOrigins = ['https://fronten-deploy.onrender.com'];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Origin:', origin); // Log the origin to debug
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin); // Log when a request is blocked
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));


>>>>>>> 7e8138841231acfc132591dd4eca1e4804d153dc
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
