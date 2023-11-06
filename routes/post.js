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



postRoute.route("/:postId/likes")
    .get(controller.getAllLikes)
    .post(auth, controller.likePost)

postRoute.route("/:postId/comments")
    .get(controller.getAllComments)
    .post(auth, controller.commentOnPost)




postRoute.route('/:postId/comments/:commentId')
    .get(controller.getComment)
    .post(auth, controller.replyToComment)
    .delete(auth, controller.deleteComment)
    .put(auth, controller.editComment)



export default postRoute;
