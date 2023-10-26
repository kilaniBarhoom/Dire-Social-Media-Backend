import 'dotenv/config.js'
import express from "express";
import { router as authRoute } from './routes/auth.js'
import mongoose from "mongoose";
import db from './config/db.config.js'
import cors from 'cors'
import errorHandler from './middleware/errorHnadler.js';

const PORT = process.env.PORT || 3000

const app = express()


// Croos origin configuration 
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use('/auth', authRoute)


// Error Handling
app.use(errorHandler)

//Connection to db
mongoose.set('strictQuery', false)
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
