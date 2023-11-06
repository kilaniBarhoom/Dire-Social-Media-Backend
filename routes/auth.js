import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../modals/user.js'
// import validateInputs from '../middleware/validateInputs.js'

const authRoute = express.Router()

authRoute.post('/signup', async (req, res, next) => {
    try {
        const { userName, email, password } = req.body;

        // validation for the entered book
        if (
            !userName ||
            !email ||
            !password
        ) {
            return res.status(400).send({ message: "Enter all required fields" })
        }


        const usernameRegex = /^[a-zA-Z0-9_]{2,}$/;
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if (!usernameRegex.test(userName)) {
            return res.status(400).send({ message: "Invalid username" })
        } else if (!emailRegex.test(email)) {
            return res.status(400).send({ message: "Invalid email" })
        }

        const newUser = {
            userName, email, password: bcrypt.hashSync(password.toString(), 12)
        }

        const user = await User.create(newUser)

        const token = jwt.sign({
            id: user._id,
            userName: user.userName,
            email: user.email
        }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN })


        res.status(201).send({
            message: "User Created Successfully",
            token,
            user,
        });
        // res.send({ message: "User Created Successfully", user })
    } catch (error) {
        next(error)
    }
})
authRoute.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // validation for the entered book
        if (
            !email ||
            !password
        ) {
            return res.status(400).send({ message: "Enter all required fields" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({
            id: user._id,
            userName: user.userName,
            email: user.email
        }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN })


        res.status(201).send({
            message: "Logged in successfully",
            token,
            user,
        });
        // res.send({ message: "User Created Successfully", user })
    } catch (error) {
        next(error)
    }
})

authRoute.get('/users', async (req, res, next) => {
    try {
        const users = await User.find({})
        return res.status(200).json({
            users: users
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message })
    }
})

export default authRoute;