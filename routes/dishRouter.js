//Contains the implementation for handling the rest api endpoints for dish and dishId
const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const mongoose = require('mongoose');
const Dishes = require('../models/dishes');              //Importing the dishes model for te schemas

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

//app.all will be executed for all the requests(get, put, post, delete). We won't use app.all, we'll expicitly declare all the endpoints

dishRouter.route('/')            
.get((req, res, next) => {                  //We'll allow this without any aut
    Dishes.find({})                         //GET is used to fetch, so we'll use the find method supported by the mongoose
        .populate('comments.author')        //Says when the dishes doc is being constructed, we'll populate the author field with the user document schema
        .then((dishes) => {                 //Once we get the data, we convert it in json format
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dishes);               //They'll put this json response in the body of the reply message
        },(err) => next(err))
        .catch((err) => next(err));         //These both will pass on the error th the overall error handler of the application and let it deal with it
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//MEANS this action is only available to autheticated user              
    Dishes.create(req.body)                 //So we'll use the mongoose create method
    .then((dish) => {
        console.log('Dish created', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {//Since put in supported, we'll leave it same
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {//This is only available to authenticated users
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
    .populate('comments.author') 
    .then((dish) => {                       //Then we'll perform the same operations
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {//We cannot just post a dishid, cause it's a modification, so not supported  
    res.statusCode = 403;
    res.end("POST operation not supported of /dishes/" + req.params.dishId);
})
.put(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {//We can modify using put operation, by update method in  mongoose
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
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {     
    Dishes.findByIdAndRemove(req.params.dishId)//Another mongoose method
    .then((resp) => {                     //Then we'll do the same as the delete me thod
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


//For Comments (crud for embedded subdocuments in a document in mongo)
dishRouter.route('/:dishId/comments')            
.get(authenticate.verifyUser, (req, res, next) => {                  //Getting the comment
    Dishes.findById(req.params.dishId)                         
        .populate('comments.author') 
        .then((dish) => {                
            if(dish != null){               //Means the dish with particular id is returned 
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments);    //Cause we want the comments of that particular dish
            }         
            else{
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.statusCode = 404;
                return next(err);           //We'll leave it for error handler
            }  
        },(err) => next(err))
        .catch((err) => next(err));         
})
.post(authenticate.verifyUser, (req, res, next) => {//Only verified users can post comments                
    Dishes.findById(req.params.dishId)                
    .then((dish) => {
        if(dish != null){                   //Means the dish with particular id is returned 
            req.body.author = req.user._id; //Since in dish schema, author stores objectId refering to user schema. Since user is verified, it's info will be in req.user
            dish.comments.push(req.body);   //Then we'll add the new comment
            dish.save()
            .then((dish) => {               //And then return the saved data
                Dishes.findById(dish._id)   //Once we getback dishes, we'll populate it with the author
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })
            }, (err) => next(err));
        }         
        else{
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.statusCode = 404;
            return next(err);               //We'll leave it for error handler
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {//Since put isn't supported, we'll leave it same
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes " + req.params.dishId + "/comments");
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            for (var i = (dish.comments.length -1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});



//OPERATION ON COMMENTS ID
dishRouter.route('/:dishId/comments/:commentId')
.get(authenticate.verifyUser, (req, res, next) => {      
    Dishes.findById(req.params.dishId)     
    .populate('comments.author') 
    .then((dish) => {                       
        if(dish != null && dish.comments.id(req.params.commentId) != null){//Means id both dish and the comment inside that dish exists       
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));//Cause we want that particular comment of that particular dish, entered by the user
        }         
        else if(dish == null){              //If dish doesn't exists
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.statusCode = 404;
            return next(err);           
        }  
        else{                               //If comment doesn't exists
            err = new Error('comment ' + req.params.commentId  + ' not found');
            err.statusCode = 404;
            return next(err); 
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {                   
    res.statusCode = 403;
    res.end("POST operation not supported of /dishes/" + req.params.dishId + "/comments/" + req.params.commentId);
})
.put(authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) { 
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)           //Once we get back the updated dish, we'll populate it back withh the authors
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })                
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser,(req, res, next) => {     
    Dishes.findById(req.params.dishId)
    .then((dish) => {                       
        if(dish != null && dish.comments.id(req.params.commentId) != null){//Means id both dish and the comment inside that dish exists       
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {                       //Then we'll return the dish back 
                Dishes.findById(dish._id)           //Once we get back the updated dish, we'll populate it back withh the authors
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })                
            }, (err) => next(err));
        }         
        else if(dish == null){              //If dish doesn't exists
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.statusCode = 404;
            return next(err);           
        }  
        else{                               //If comment doesn't exists
            err = new Error('comment ' + req.params.commentId  + ' not found');
            err.statusCode = 404;
            return next(err); 
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;        //Cause we gotta export it to index file