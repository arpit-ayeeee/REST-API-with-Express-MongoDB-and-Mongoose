var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');           //We'll use the mongoose
const dishes = require('./models/dishes');      //For the mongoose schemas
const promotions = require('./models/promotions');
const leaders = require('./models/leaders');
const url = 'mongodb://127.0.0.1:27017/conFusion';//Linking the url to mongoDB server
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
app.use(cookieParser());

function auth(req, res,next){
  console.log(req.headers);

  var authHeader = req.headers.authorization;   //We'll get hold of the authorization header added by the client-side
  if(!authHeader){                              //If it's null, ie no username and pass provided by the user
    var err = new Error('You are not authenticated!');
     
    res.setHeader('WWW-Authenticate','Basic');  //Then we'll challenge the user, by sending back a response mesage
    err.status = 401;                           //For unauthorised access
    return next(err);                           //This will directly go to error handler
  }
  //Else authorisation header exists
  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');//The header after splitting has two elements,an array of Basic and base64 encoded string, so we took the second (base64 encoded string ) element which has username and password, convert it to string and split it again into two parts(username and pass)
  //At the end this auth will contain two items, username and pass, which is extracted from the base64 string
  var username = auth[0];
  var password = auth[1]; 
  if(username === 'admin' && password === 'password'){
    next();                                     //So, if this condition clears, this will pass on to next operation
  }
  else{                                         //That means username and pass did not match 
    var err = new Error('You are not authenticated!');

    res.setHeader('WWW-Authenticate','Basic');  //Then we'll challenge the user, by sending back a response mesage
    err.status = 401;                           //For unauthorised access
    return next(err); 
  }
};
app.use(auth);                                  //We'll apply authentication right before we'll serve the data

//Serving all the data
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
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
