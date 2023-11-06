import Post from "../modals/post.js";
import { Types } from "mongoose";

export const get = async (req, res, next) => {
    try {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $unset: ["owner.password"]
            },
        ]);
        if (posts) {
            return res.status(200).send({
                posts: posts
            })
        }
    } catch (error) {
        next(error)
    }
}

export const create = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).send({
                message: "Post can't be empty!",
            });
        }




        const newPost = {
            owner: req.user._id,
            text,
            likes: [],
            comments: [],
        };

        const post = await Post.create(newPost);

        res.send({ message: "Post created successfully", post });
    } catch (error) {
        next(error);
    }
}

export const getOne = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = (await Post.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(postId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $unset: ["owner.password"]
            },
        ]))[0]
        if (!post) {
            return res.status(404).send({ message: "Post not found" })
        }
        res.status(200).send({ post })
    } catch (error) {
        next(error)
    }
}

export const update = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const newText = req.body.text;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }
        if (req.user._id.toString() !== post.owner.toString()) {
            return res.status(401).send({ message: "You are not the post owner" });
        }
        post.text = newText;
        await post.save();

        res.send({ message: "Post Updated Successfully" });
    } catch (error) {
        next(error);
    }
}


export const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findOne({ _id: postId })
        if (req.user._id.toString() !== post.owner.toString()) {
            return res.status(401).send({ message: "You are not the post owner" });
        }
        if (post) {
            await Post.deleteOne({ _id: postId });
            res.send({ message: "Post Deleted Successfully" });
        } else {
            res.send({ message: "Post doesn't exist" })
        }
        console.log(post);
    } catch (error) {
        next(error);
    }
};