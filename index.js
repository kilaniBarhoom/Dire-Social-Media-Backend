import 'dotenv/config.js'
import express from "express";
import authRoute from './routes/auth.js'
import postRoute from './routes/post.js';
import mongoose from "mongoose";
import db from './config/db.config.js'
import cors from 'cors'
import errorHandler from './middleware/errorHnadler.js';
import bodyParser from 'body-parser'



const PORT = process.env.PORT || 3000

const app = express()



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Croos origin configuration s
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use('/', authRoute)
app.use('/posts', postRoute)


// Error Handling
app.use(errorHandler)

//Validation Inputs
// app.use(validateInputs.inputValidation())

//Connection to db
mongoose.connect(db.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log(`app connected to db`);
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        })
    })
    .catch(err => {
        console.log(`Error happened ${err}`);
    })
