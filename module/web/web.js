// Web.js:
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(cookieParser());

module.exports = {
    express, app,http,io, server
}

// Web: <script src='/socket.io/socket.io.js'></script>