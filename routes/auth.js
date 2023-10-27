import express from 'express'
import bcrypt from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import User from '../modals/user.js'
// import validateInputs from '../middleware/validateInputs.js'

const router = express.Router()

router.post('/register', async (request, response, next) => {
    try {
        const { userName, email, password } = request.body;

        // validation for the entered book
        if (
            !userName ||
            !email ||
            !password
        ) {
            return response.status(400).send({ message: "Enter all required fields" })
        }
        const newUser = {
            userName, email, password: bcrypt.hashSync(password, 12)
        }

        const user = await User.create(newUser)

        const token = jsonwebtoken.sign({
            id: user._id,
            userName: user.userName,
            email: user.email
        }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN })


        response.status(201).send({
            message: "User Created Successfully",
            token,
            data: {
                user,
            },
        });
        // response.send({ message: "User Created Successfully", user })
    } catch (error) {
        next(error)
    }
})

router.get('/users', async (request, response, next) => {
    try {
        const users = await User.find({})
        return response.status(200).json({
            users: users
        })
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

export { router }