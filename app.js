var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');    //Just like body-parser, it's used to parse the body of cookie
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);//It'll take session as a parameters
var passport = require('passport');
var autheticate = require('./authenticate');

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
//app.use(cookieParser('12345-67890-09876-54321'));//It is used to parse the body of the cookie and we'll provide a secret-key as a parameter              
app.use(session({                               //We'll use session middleware instead of a cookie-parser
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());                    //This is used to take record of the session, so that when same user sends requests again, the passport loads req.user automatically

//Means user can access the index and users endpoint w/o getting autheticated
app.use('/', indexRouter);
app.use('/users', usersRouter);

//AUTHENTICATION (To clear this user needs to get authenticated from prev step)
function auth(req, res,next){
  //If req.user hasn't already been added by the passport sessions, that means the user hasn't been authorised yet, so we'll autheticate it and setup a session if it's authenticated
  if(!req.user){                
      var err = new Error('You are not authenticated!');
      err.status = 403;                         //For unauthorised access
      return next(err);                         //This will directly go to error handler
    }
  else{                                         //Means req.user is automatically loaded by the passport session, so user is autenticated
    next();
  }
};
app.use(auth);                                  //We'll apply authentication right before we'll serve the data

//Serving all the data
app.use(express.static(path.join(__dirname, 'public')));
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
