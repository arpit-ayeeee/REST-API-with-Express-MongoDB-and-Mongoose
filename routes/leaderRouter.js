const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req, res, next) => {       
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    next(); 
})
.get((req, res, next) => {       
    res.end("Leaders will come from here!"); 
})
.post((req, res, next) => {      
     res.end("Will add the leader : " + req.body.name + " with details : " + req.body.description);  
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported of leaders");
})
.delete((req, res, next) => {    
    res.end("Deleting all the leaders");
});

leaderRouter.route('/:leaderId')
.get((req, res, next) => {      
    res.end("Will send details of the leader: " + req.params.leaderId + " to you!"); //As we'll show the parameter value
})
.post((req, res, next) => {    
    res.statusCode = 403;
    res.end("POST operation not supported for /leaders/" + req.params.leaderId);
})
.put((req, res, next) => { 
    res.write("Updating the leader: " + req.params.leaderId + "\n");  
    res.end("Will update the leader: " + req.body.name + " with details: " + req.body.description);
})
.delete((req, res, next) => {     
    res.end("Deleting leader: " + req.params.promoId);
});

module.exports = leaderRouter;    