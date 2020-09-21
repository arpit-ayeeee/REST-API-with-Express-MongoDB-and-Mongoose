//This is a Node Module used to store the authentication strategies that we will configure

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;//Support this method
var User = require('./models/user');


//Configuring the passport with LocalStrategy and exporting it
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//The LocalStrategy method is supplied with a verify function, which is used to verify the user 
//The verify function will be called with the Username and Password, that the passport will extract from the incoming request
//Since we used the passport-local-mongoose plugin, it adds a method to User schema called authenticate 
//The autheticate method will itself act as an authetication function for the LocalStrategy
//Serialize and deserialize methods are provided by the mongoose plugin in User schema, which take cares for the support for sessions in passport.