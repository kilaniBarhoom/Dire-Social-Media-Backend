import { MongooseError } from "mongoose";

function errorHandler(error, request, response, next) {
    if (error instanceof MongooseError.ValidationError) {
        response.status(400).send({
            message: error.message
        })
    } else if (error instanceof MongooseError.CastError) {
        response.status(404).send({
            message: 'Resource not found'
        })
    } else if (error.code === 11000) {
        const duplicatedKey = error.keyValue.userName ? 'userName' : 'email';

        response.status(409).send({
            message: `${duplicatedKey} is already in use`
        })
    } else if (error.name === 'JsonWebTokenError') {
        response.status(401).send({
            message: 'Invalid token'
        })
    } else if (error.name === 'SyntaxError') {
        response.status(400).send({
            message: error.message
        })
    } else {
        response.status(500).send({
            message: error,
           d: request.body
        })
    }
}

export default errorHandler