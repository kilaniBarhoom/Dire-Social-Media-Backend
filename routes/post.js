import express from "express";

import auth from "../middleware/auth.js";
import * as controller from "../controllers/post.js";
const postRoute = express.Router({
    mergeParams: true,
});

postRoute.route("/")
    .get(controller.get)
    .post(auth, controller.create);

postRoute.route("/:postId")
    .get(controller.getOne)
    .put(auth, controller.update)
    .delete(auth, controller.deletePost);

export default postRoute;
