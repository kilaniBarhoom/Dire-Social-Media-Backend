import User from '../modals/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export const signup = async (req, res, next) => {
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
        } else if (password.length < 8) {
            return res.status(400).send({ message: "Password too short" })
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
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // validation for the entered book
        if (
            !email ||
            !password
        ) {
            return res.status(400).send({ message: "Enter all required fields" })
        }

        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if (!emailRegex.test(email)) {
            return res.status(400).send({ message: "Invalid email" })
        } else if (password.length < 8) {
            return res.status(400).send({ message: "Password too short" })
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
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password')
        return res.status(200).json({
            users: users
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message })
    }
}

export const deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
}

export const getPosts = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId)
        if (user) {
            return res.status(200).json({
                posts: user.posts
            })
        } else {
            return res.status(404).send({
                message: "User not found"
            })
        }
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

export const editUser = async (req, res, next) => {
    try {
        const { userName, email, bio } = req.body;

        // validation for the entered book
        if (
            !userName ||
            !email
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

        const userId = req.user._id.toString()
        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        await User.updateOne({ _id: userId }, { $set: { userName: userName, email: email, bio: bio } })
        res.status(201).send({
            message: "User updated successfully",
        });
        // res.send({ message: "User Created Successfully", user })
    } catch (error) {
        next(error)
    }
}

export const follow = async (req, res, next) => {
    try {
        const followedId = req.params.userId;
        const followingId = req.user._id.toString()
        const followedUser = await User.findById(followedId)
        const followingUser = await User.findById(followingId)
        if (followedId == followingId) {
            return res.status(400).send({ message: "User can't follow himself" })
        }
        if (followedUser && followingUser) {
            if (followingUser.following.find(followed => followed == followedId)) {
                followingUser.following.pull(followedId)
                followedUser.followers.pull(followingId)
                followingUser.save()
                followedUser.save()
                res.status(200).send({ message: "Unfollowed" })
            } else {
                followingUser.following.push(followedId)
                followedUser.followers.push(followingId)
                followingUser.save()
                followedUser.save()
                res.status(200).send({ message: "Followed" })
            }

        } else {
            return res.status(404).send({
                message: "User not found"
            })
        }
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

