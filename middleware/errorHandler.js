const ServerError = require("../utils/error");


const errorHandler = (err, req, res, next) => {

    //Handling cast error on object id;
    if(err.name == "CastError") {
        err.message = `${err.path} is wrongly formated`;
        err.status = 400;
    }

    //Handling validation errors

    if(err.name == "ValidationError") {
    
        const joiner = err.errors[Object.keys(err.errors)[0]];

        
        err.message = joiner.properties ? joiner.properties['message'] : `${joiner.path.toUpperCase()} should be  ${joiner.kind.toUpperCase()} not ${joiner.valueType.toUpperCase()}`;

        err.status = 400;  
    }

    //Handling duplicate fields;
    
     if(err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue)[0]
        
       const message = `${duplicateField === "slug" ? "title".toUpperCase() : duplicateField.toUpperCase()} field should be unique`;
       
       err.message = message;
       err.status= 409;
     }

     console.log(err);
    res.status(err.status || 500).json({success: false, error: err.message})
}


module.exports = errorHandler;