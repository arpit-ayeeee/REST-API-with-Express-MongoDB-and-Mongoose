//Contains the implementation for handling the rest api endpoints for dish and dishId

const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());
//Now we dont need to specify the path everytime, we just gonna attack em all
dishRouter.route('/')
//app.all will be executed for all the requests(get, put, post, delete)
.all((req, res, next) => {       //It takes endpoints as first para and callback function as second.
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    next(); //Next function will continue to look for additional spec functions below this app.all function
})
.get((req, res, next) => {       //Now the modified co  value of res, will be passed to this function from app.all if get req is recieved
    res.end("Dishes will come from here!"); //Get means we're fetching the dish from server
})
.post((req, res, next) => {      //Post means we're posting a new dish to the server
     res.end("Will add the dish : " + req.body.name + "with details : " + req.body.description);    //When we recieve a post req, the value will come to this function from app.all
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported of dishes");
})
.delete((req, res, next) => {     //DELETE means we're deleting a dish from server
    res.end("Deleting all the dishes ");
});


//OPERATION ON DISH ID
dishRouter.route('/:dishId')
.get((req, res, next) => {      
    res.end("Will send details of the dish: " + req.params.dishId + "to you!"); //As we'll show the parameter value
})
.post((req, res, next) => {    //We cannot just post a dishid, cause it's a modification, so not supported  
    res.statusCode = 403;
    res.end("POST operation not supported of /dishes/" + req.params.dishId);
})
.put((req, res, next) => {   //We can modify using put operation
    res.write("Updating the dish: " + req.params.dishId + "\n");   //res.writeis used to add a line to response
    res.end("Will update the dish: " + req.body.name + "with details: " + req.body.description);
})
.delete((req, res, next) => {     
    res.end("Deleting dish: " + req.params.dishId);
});

module.exports = dishRouter;        //Cause we gotta export it to index file