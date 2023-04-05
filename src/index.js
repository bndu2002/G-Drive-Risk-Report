const express = require('express')
const app = express()
const mongoose = require('mongoose')
const route = require('./routes/route.js');
const cookieParser = require('cookie-parser');
const PORT = 3000

app.use(cookieParser());

// Set refresh token in cookie


app.use(express.json())

mongoose.connect("mongodb+srv://vandana:7CJBNDDwPorDTTrX@cluster0.crrs6th.mongodb.net/vandana-db").then(() => { console.log('MongoDB is Connected') }).catch(err => console.log(err))

app.use('/', route);


app.listen(  PORT, function () {
    console.log('Express app running on port ' + PORT)
});


//https://developers.google.com/drive/api/quickstart/nodejs
//https://console.cloud.google.com/apis/dashboard?project=g-drive-risk-report-382106