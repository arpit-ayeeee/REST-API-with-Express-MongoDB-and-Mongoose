//THIS IS MONGOOSE FILE FOR DISHES SCHEMA'S FOR THE MONGODB DATABASE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);    //This will load the new currency type in mongoose and then we'll use it
const Currency = mongoose.Types.Currency;           //We declare a type which is just like other ie string, number


const commentSchema = new Schema({
    rating: {
        type: Number,
         min: 1,
         max: 5,
         required: true
    },
    comment: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,                 //Means, it's compulsory
        unique: true                    //Means no two docs should have the same name
    },
    description: {
        type: String,
        required: true
    },
    image : {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    label: {
        type: String,
        default: ''                     //If we dont specify requird, we can simply give it a default value
    },
    price: {
        type: Currency,                 //We imported the currency module and declared a variable which is equal to that
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [ commentSchema ]         //This will have an array for comments, for which there will be comentSchema for for each
},{
    timestamps: true                    //This will add created at and updated at, two timstamps to each doc stored in here.
});

var Dishes = mongoose.model('Dish', dishSchema);//We'll model the schema in order to export it
module.exports = Dishes;
