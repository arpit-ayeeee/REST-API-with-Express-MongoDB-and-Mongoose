var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');    //Just like body-parser, it's used to parse the body of cookie
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);//It'll take session as a parameters
var passport = require('passport');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');           //We'll use the mongoose
mongoose.Promise = require('bluebird');

const url = config.mongoUrl;                    //Linking the url to mongoDB server
const connect = mongoose.connect(url);          //Connecting to the mongodb server

connect.then((db) => {                          //This will establish the connection to mongodb server on this file
  console.log('Connected correctly to the server');

}, (err) => console.log(err));

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));//It is used to parse the body of the cookie and we'll provide a secret-key as a parameter              

app.use(passport.initialize());

//Means user can access the index and users endpoint w/o getting autheticated
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));
//Adding authentication to all options except the GET requests
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);  

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
