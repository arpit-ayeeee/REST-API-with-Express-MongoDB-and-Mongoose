var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {                                    //Means when the new user is created, by default, it wont be an admin
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', User);