const express = require('express')
const cors = require('cors')
require('dotenv').config()
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app, server } = require('./socket/index')
const mongoConnection = require('./config/connectDB')


app.use(cors({
    origin: '*',
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
