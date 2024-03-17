"use strict";

var express = require('express');

var app = express();

var connectToDatabase = require('./config/Database');

var userRoute = require('./routes/user');

var chatRoute = require('./routes/chat');

var authRoute = require('./routes/auth');

var messageRoute = require('./routes/message');

var ErrorHandler = require('./middleware/ErrorHandler');

var cookieParser = require('cookie-parser');

require('dotenv').config();

var cors = require('cors');

var NotFound = require('./errors/NotFound');

var endPointStartWith = '/api/v1';
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000']
}));
var port = process.env.PORT || 3000;
var urlDataBase = process.env.DATABASE_URL;
app.use(express.json({
  limit: '10kb'
}));
app.use(cookieParser());
app.use("".concat(endPointStartWith, "/auth"), authRoute);
app.use("".concat(endPointStartWith, "/user"), userRoute);
app.use("".concat(endPointStartWith, "/chat"), chatRoute);
app.use("".concat(endPointStartWith, "/message"), messageRoute);
app.all('*', function (req, res, next) {
  next(new NotFound("Cant find ".concat(req.originalUrl, " on this server"), 404));
});
app.use(ErrorHandler);
connectToDatabase(urlDataBase);
app.listen(port, function () {
  console.log("localhost:", port);
});
//# sourceMappingURL=index.dev.js.map
