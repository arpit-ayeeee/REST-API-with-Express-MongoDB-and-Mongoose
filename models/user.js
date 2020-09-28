var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
//The username and password schema will be automatically be added by the passport-local-mongoose plugin

var User = new Schema({
    firstname: {                                //First and last name for the author to populate it
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {                                    //Means when the new user is created, by default, it wont be an admin
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);             //By this we'll make the passport-local-mongoose plugin available to the User schema

module.exports = mongoose.model('User', User);