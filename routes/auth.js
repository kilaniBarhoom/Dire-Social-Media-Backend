import express from 'express'
import auth from '../middleware/auth.js'
import * as controller from "../controllers/auth.js";

const authRoute = express.Router()

authRoute.post('/signup', controller.signup)
authRoute.post('/login', controller.login)
authRoute.route('/users')
    .get(controller.getAllUsers)
    .put(auth, controller.editUser)
authRoute.delete("/delete-account", auth, controller.deleteAccount);
authRoute.get('/:userId/posts', controller.getPosts)

// Follow a user

authRoute.route('/follow/:userId')
    .post(auth, controller.follow)

export default authRoute;