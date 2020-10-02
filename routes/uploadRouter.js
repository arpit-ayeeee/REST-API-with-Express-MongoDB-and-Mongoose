//This router is gonna support the uploading of the files
const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({                               //Multer provides functions to enable storage engine, and it can be configured into many ways
    destination: (req, file, cb) => {                            //Destination provides the location where the file is to be stored, it takes request, file and a callback function as a parameter
        cb(null, 'public/images');                               //The callback function will take error == null, and destination folder

    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);                             //This tells the file will be uploaded and saved with the same name, else the multer will give a random string name to the
        
    }
});
const imageFileFilter = (req, file, cb) => {                    //File filter specifies which kind of file are we willing to upload or accept
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){      //Checking if the string does not match the regular expression for any of the extension type
        return cb(new Error("You can upload only image files"), false);//Then we'll send an error
    }
    cb(null, true);                                             //Then we'll proceed                                    
}

//Now we'll cofigure the multer module
const upload = multer({ storage: storage, fileFilter: imageFileFilter });


const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());


uploadRouter.route('/')    
.get(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {//Not allowed
    res.statusCode = 403;
    res.end("PUT operation not supported on /imageUpload");
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,
     upload.single('imageFile'), (req, res) => {                //upload.single only allows us to upload single file, and it has it's own error handler
        res.statusCode= 200;
        res.setHeader('Content-type','application/json');
        res.json(req.file);                                     //We'll pass the file back to the client form the server
    }
)
.put(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {//Not allowed
    res.statusCode = 403;
    res.end("PUT operation not supported on /imageUpload");
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {//Not allowed
    res.statusCode = 403;
    res.end("PUT operation not supported on /imageUpload");
})


module.exports = uploadRouter;