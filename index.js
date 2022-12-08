const http = require("http");
const express = require("express");
const {app} = require("./app");
const server = http.createServer(app);
const path = require('path')


const {API_PORT} = process.env;
const port = process.env.PORT || API_PORT;
const authRoutes = require('./routes/auth.routes')

console.log("hello")

// View Engine Setup
app.set('views',path.join(__dirname, 'temp'))
app.set('view engine', 'ejs')


//setup static folders
// app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

//setup routes\

app.use(authRoutes)


server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});