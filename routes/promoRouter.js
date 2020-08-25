const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req, res, next) => {       
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    next(); 
})
.get((req, res, next) => {       
    res.end("Promotions will come from here!"); 
})
.post((req, res, next) => {      
     res.end("Will add the promotion : " + req.body.name + " with details : " + req.body.description);  
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported of promotions");
})
.delete((req, res, next) => {    
    res.end("Deleting all the promotions");
});

promoRouter.route('/:promoId')
.get((req, res, next) => {      
    res.end("Will send details of the promotion: " + req.params.promoId + " to you!"); //As we'll show the parameter value
})
.post((req, res, next) => {    
    res.statusCode = 403;
    res.end("POST operation not supported for /promotions/" + req.params.promoId);
})
.put((req, res, next) => { 
    res.write("Updating the promotion: " + req.params.promoId + "\n");  
    res.end("Will update the promotion: " + req.body.name + " with details: " + req.body.description);
})
.delete((req, res, next) => {     
    res.end("Deleting promotion: " + req.params.promoId);
});

module.exports = promoRouter;    