//This is a Node Module used to store the authentication strategies that we will configure
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;     
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;        
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('./config');
const Dishes = require('./models/dishes');

//CONFIGURING the passport with LocalStrategy and exporting it
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//The LocalStrategy method is supplied with a verify function, which is used to verify the user 
//The verify function will be called with the Username and Password, that the passport will extract from the incoming request
//Since we used the passport-local-mongoose plugin, it adds a method to User schema called authenticate 
//The autheticate method will itself act as an authetication function for the LocalStrategy
//Serialize and deserialize methods are provided by the mongoose plugin in User schema, which take cares for the support for sessions in passport.





//JwtStrategy is supported by passport-jwt node module, which will provide us with JSON web token based strategy for configurng our passport module.
//Get token
exports.getToken = function(user){             //We'll create a token using jwt, by passing user which is an object
    return jwt.sign(user, config.secretKey,    //This jwt command create a jwt token, it takes user object, secretKey and some other parameters such as expiresIn. 
        {expiresIn: 3600});                    //3600 seconds
};

//CONFIGURING the passport with JWT based strategy
var opts = {};                                 //Will create options
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();//This option will specify how json web token will be extracted from the incoming request message.
opts.secretOrKey = config.secretKey;           //This options will supply us the secretkey which we'll use in strategy
                                               //Now we'll configure the passport with jwt strategy
exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log('JWT payload: ', jwt_payload);
    User.findOne({_id: jwt_payload._id}, (err, user) => {//We'll find the user, using the id provided in jwt_payload, and return a callback function 
            if (err){                          //If there is an error, means the user isn't found
                return done(err, false);       //false means that the user doesn't exists as this is an error value     
            }
            else if (user){                    //If user exists 
                return done(null, user);
            }
            else{
                return done(null, false);      //We couldn't find the user
            }
        });
}));
exports.verifyUser = passport.authenticate('jwt', {session: false});
//session: false, means we're not gonna create session in this case
//The first parameter specifies the strategy we're goin to be using
//This verifyUser method makes use of the token that comes in the authHeader and then verifyies the user
//Now anywhere if we want to verify the user we can simply call this above method

 

/// VERIFYADMIN
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
      next();
    } else {
      let err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      return next(err);
    }
  };





//   exports.verifyUser = function (req, res, next) {
//     var token = req.body.token || req.query.token || req.headers['x-access-token'];
//     if (token) {
//         jwt.verify(token, config.secretKey, function (err, decoded) {
//             if (err) {
//                 var err = new Error('You are not authenticated!');
//                 err.status = 401;
//                 return next(err);
//             } else {
//                 req.decoded = decoded;
//                 next();
//             }
//         });
//     } else {
//         var err = new Error('No token provided!');
//         err.status = 403;
//         return next(err);
//     }
// };