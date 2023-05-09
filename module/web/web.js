// Web.js:
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const hbs = require('express-handlebars');

app.use(bodyParser.json());
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs.engine())
app.set('view engine', 'handlebars');

module.exports = {
    express, app,http,io, server
}

// Web: <script src='/socket.io/socket.io.js'></script>