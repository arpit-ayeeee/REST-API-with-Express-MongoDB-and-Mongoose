var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');                        //Importng the modelSchema     
const { Router } = require('express');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json()); 

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
      .then(
        (users) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(users);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  }
);

//SIGNUP
router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => { 
  //Register method is provided by the mongoose plugin, which take new user created, password from body and a callback function
      if(err){                                             
        res.statusCode= 500;
        res.setHeader('Content-type','Application/json');
        res.json({err: err});
      } 
      else{                                      //We'll authenticate the same user we just registered and send a message in the callback function
        if(req.body.firstname)                   //Once user is signed up, if there is first and last name we add it up to the user schema
          user.firstname = req.body.firstname;
        if(req.body.lasttname)
          user.lastname = req.body.lastname;
        user.save((err,user) => {
          if(err){
            res.statusCode= 500;
            res.setHeader('Content-type','Application/json');
            res.json({err: err});
            return;
          }
          passport.authenticate('local')(req, res, () => {//We'll authenticate the same user we just registered and send a message in the callback function, tot ensure that the user registrationis successfull
            res.statusCode= 200;
            res.setHeader('Content-type','Application/json');
            res.json({success: true, status: 'Registration Successfull!'});
          })
        }) ;
      }
    })
});

//LOGIN
//We'll simply authenticate the user using local strategy and when it's done, we'll pass reply message and give back a token which will later be used 
router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id}); //We already had a method to create token, which takes user as a payload for parameter
  res.statusCode= 200;
  res.setHeader('Content-type','Application/json');
  res.json({
    success: true,
    token: token,                                         //We'll pass the token back
    status: 'Login Successfull!'
  });
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













// //SIGNUP USING SESSIONS ONLY
// router.post('/signup', (req, res, next) => {
//   User.findOne({username: req.body.username})               //The username and pass will be send by the client in req.body, so we'll if the username already exists or not
//     .then((user) => {                                       //Then we pass the user returned in prev search
//       if(user != null){                                     //Means there already exists one user with same useranme
//          var err = new Error('User ' + req.body.username + ' already exists');
//          err.status = 403;
//          next(err);
//       } 
//       else{                                                 //Mean user doesn't exists, so we'll allow  to sign in
//         return User.create({                                //So we'll create a new user in schema
//           username: req.body.username,
//           password: req.body.password
//         });
//       }
//     })
//     .then((user) => {
//       res.statusCode= 200;
//       res.setHeader('Content-type','Application/json');
//       res.json({status: 'Registration Successfull!', user: user});
//     }, (err) => next(err))
//     .catch((err) => next(err)); 
// });


// //Basic Login Without Passport
// //LOGIN
// router.post('/login', (req, res, next) => {
//   if(!req.session.user){                 
//     var authHeader = req.headers.authorization; //We'll get hold of the authorization header added by the client-side
//     if(!authHeader){                            //If it's null, ie no username and pass provided by the user
//       var err = new Error('You are not authenticated!');
      
//       res.setHeader('WWW-Authenticate','Basic');//Then we'll challenge the user, by sending back a response mesage
//       err.status = 401;                         //For unauthorised access
//       return next(err);                         //This will directly go to error handler
//     }
//     //Else authorisation header exists
//     var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');//The header after splitting has two elements,an array of Basic and base64 encoded string, so we took the second (base64 encoded string ) element which has username and password, convert it to string and split it again into two parts(username and pass)
//     //At the end this auth will contain two items, username and pass, which is extracted from the base64 string
//     var username = auth[0];
//     var password = auth[1]; 

//     User.findOne({username: username})
//     .then((user) => {
//       if(user === null){
//         var err = new Error('User ' + username + ' not found!');
//         err.status = 403;                         
//         return next(err);
//       }
//       else if(user.password != password){
//         var err = new Error('Wrong password!');
//         err.status = 403;                         
//         return next(err);
//       }
//       else if(user.username === username && user.password === password){
//         req.session.user = 'authenticated';               //We'll setup the user property from session to admin
//         res.statusCode = 200;
//         res.setHeader('Content-type','text/plain');
//         res.end('You are authenticated!');                            
//       }
//     })
//     .catch((err) => next(err));
//   }
//   else{
//     res.statusCode = 200;
//     res.setHeader('Content-type', 'text/plain');
//     res.end('You are already authenticated'); 
//   }
// })


//IN app.js FOR AUTHENTICATION W/O PASSPORT 
// //AUTHENTICATION (To clear this user needs to get authenticated from prev step)
// function auth(req, res,next){
//   console.log(req.session);                     //We'll check wheather we get a session from the express session or not

//   //If incoming req doesn't have user field in session, that means the user hasn't been authorised yet, so we'll autheticate it and setup a session if it's authenticated
//   if(!req.session.user){                
//       var err = new Error('You are not authenticated!');
      
//       res.setHeader('WWW-Authenticate','Basic');//Then we'll challenge the user, by sending back a response mesage
//       err.status = 401;                         //For unauthorised access
//       return next(err);                         //This will directly go to error handler
//     }
//   else{                                         //Means the user property for the signed cookie already exists
//     if(req.session.user === 'authenticated'){            //If it matches the only defined authentication
//       next();
//     } 
//     else{                                       //Means wrong cookie, user isn't authenticated
//       var err = new Error('You are not authenticated!');
//       err.status = 403;                        
//       return next(err); 
//     }
//   }
// };
// app.use(auth);                                  //We'll apply authentication right before we'll serve the data
