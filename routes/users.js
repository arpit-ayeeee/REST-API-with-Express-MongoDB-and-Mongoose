var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');                        //Importng the modelSchema     
const { Router } = require('express');

var router = express.Router();
router.use(bodyParser.json()); 

/* GET users listing. */
router.get('/',function(req, res, next) {
  res.send('respond with a resource');
});

//SIGNUP
router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})               //The username and pass will be send by the client in req.body, so we'll if the username already exists or not
    .then((user) => {                                       //Then we pass the user returned in prev search
      if(user != null){                                     //Means there already exists one user with same useranme
         var err = new Error('User ' + req.body.username + ' already exists');
         err.status = 403;
         next(err);
      } 
      else{                                                 //Mean user doesn't exists, so we'll allow  to sign in
        return User.create({                                //So we'll create a new user in schema
          username: req.body.username,
          password: req.body.password
        });
      }
    })
    .then((user) => {
      res.statusCode= 200;
      res.setHeader('Content-type','Application/json');
      res.json({status: 'Registration Successfull!', user: user});
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

//LOGIN
router.post('/login', (req, res, next) => {
  if(!req.session.user){                 
    var authHeader = req.headers.authorization; //We'll get hold of the authorization header added by the client-side
    if(!authHeader){                            //If it's null, ie no username and pass provided by the user
      var err = new Error('You are not authenticated!');
      
      res.setHeader('WWW-Authenticate','Basic');//Then we'll challenge the user, by sending back a response mesage
      err.status = 401;                         //For unauthorised access
      return next(err);                         //This will directly go to error handler
    }
    //Else authorisation header exists
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');//The header after splitting has two elements,an array of Basic and base64 encoded string, so we took the second (base64 encoded string ) element which has username and password, convert it to string and split it again into two parts(username and pass)
    //At the end this auth will contain two items, username and pass, which is extracted from the base64 string
    var username = auth[0];
    var password = auth[1]; 

    User.findOne({username: username})
    .then((user) => {
      if(user === null){
        var err = new Error('User ' + username + ' not found!');
        err.status = 403;                         
        return next(err);
      }
      else if(user.password != password){
        var err = new Error('Wrong password!');
        err.status = 403;                         
        return next(err);
      }
      else if(user.username === username && user.password === password){
        req.session.user = 'authenticated';               //We'll setup the user property from session to admin
        res.statusCode = 200;
        res.setHeader('Content-type','text/plain');
        res.end('You are authenticated!');                            
      }
    })
    .catch((err) => next(err));
  }
  else{
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    res.end('You are already authenticated'); 
  }
})


//LOGOUT
router.get('/logout',(req, res) => {
  if(req.session){
    req.session.destroy();                                //BuiltIn method used to delete the session
    res.clearCookie('session-id');                        //By this response, we're asking the client to delete the cookie on the client-side by the session-id provided
    res.redirect('/');
  }
  else{
    var err = newError("You are not logged in");
    err.status = 403;
    next(err); 
  }
})

module.exports = router;
