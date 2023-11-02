import express from "express";
import Post from "../modals/post.js";

const postRoute = express.Router();

postRoute.post(
    "/create",
    async (req, res, next) => {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).send({
                    message: "Post can't be empty!",
                });
            }

            
                

            const newPost = {
                text,
            };

            const post = await Post.create(newPost);

            res.send({ message: "Post created successfully", post });
        } catch (error) {
            next(error);
        }
    }
);
postRoute.get('', async (req, res, next) => {
    try {
        const posts = await Post.find({})
        if (posts) {
            return res.status(200).send({
                posts: posts
            })
        }
    } catch (error) {
        next(error)
    }
})
postRoute.delete(
    "/delete/:postId",
    async (req, res, next) => {
        try {
            const postId = req.params.postId;

            const post = await Post.findOne({ _id: postId })
            if (post) {
                await Post.deleteOne()
                res.send({ message: "Post Deleted Successfully" });
            } else {
                res.send({ message: "Post doesn't exist" })
            }
            console.log(post);
        } catch (error) {
            next(error);
        }
    }
);
postRoute.put(
    "/update/:postId",
    async (req, res, next) => {
        try {
            const { postId } = req.params.postId;
            const newText = req.body.text;

            const post = await Post.updateOne({ _id: postId }, { $set: { text: newText } })

            if (updatedPost.nModified === 0) {
                return res.status(404).json({ message: 'Post not found' });
            }

            res.send({ message: "Post Updated Successfully" });
        } catch (error) {
            next(error);
        }
    }
);
export default postRoute;
