//Contains the implementation for handling the rest api endpoints for dish and dishId
const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Dishes = require('../models/dishes');              //Importing the dishes model for te schemas

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

//app.all will be executed for all the requests(get, put, post, delete). We won't use app.all, we'll expicitly declare all the endpoints

dishRouter.route('/')            
.get((req, res, next) => {  
    Dishes.find({})                         //GET is used to fetch, so we'll use the find method supported by the mongoose
        .then((dishes) => {                 //Once we get the data, we convert it in json format
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dishes);               //They'll put this json response in the body of the reply message
        },(err) => next(err))
        .catch((err) => next(err));         //These both will pass on the error th the overall error handler of the application and let it deal with it
})
.post((req, res, next) => {                 //Post means we're creating a new dish to the server
    Dishes.create(req.body)                 //So we'll use the mongoose create method
    .then((dish) => {
        console.log('Dish created', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {                  //Since put in supported, we'll leave it same
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
})
.delete((req, res, next) => {               //DELETE means we're deleting every dish from server, this is very dangerous option
    Dishes.remove({})                       //We'll get some response    
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


//OPERATION ON DISH ID
dishRouter.route('/:dishId')
.get((req, res, next) => {      
    Dishes.findById(req.params.dishId)      //This time we'll use findById method to get the dish
    .then((dish) => {                       //Then we'll perform the same operations
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {                 //We cannot just post a dishid, cause it's a modification, so not supported  
    res.statusCode = 403;
    res.end("POST operation not supported of /dishes/" + req.params.dishId);
})
.put((req, res, next) => {                  //We can modify using put operation, by update method in  mongoose
    Dishes.findByIdAndUpdate(req.params.dishId,{ //Second para is to update, first para is to select the dish
        $set: req.body,                     //The update will be in the body of the request
    },{ new: true})                         //This will update the dish
    .then((dish) => {                       //Then we'll take the updated dish and perform the same operations
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {     
    Dishes.findByIdAndRemove(req.params.dishId)//Another mongoose method
    .then((resp) => {                     //Then we'll do the same as the delete me thod
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;        //Cause we gotta export it to index file