import Post from "../modals/post.js";
import User from "../modals/user.js";
import { Types } from "mongoose";

// Post control

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
        const userId = req.user._id
        const user = await User.findById(userId)
        user.posts.push(post)
        user.save()
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
            const userId = req.user._id.toString();
            const user = await User.findById(userId)
            user.posts.pull(postId)
            await Post.deleteOne({ _id: postId });
            await user.save()
            res.send({ message: "Post Deleted Successfully" });
        } else {
            res.send({ message: "Post doesn't exist" })
        }
    } catch (error) {
        next(error);
    }
};

// Like control

export const getAllLikes = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId)

        if (post) {
            return res.status(201).send({ Likes: post.likes })
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
};

export const likePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId)

        if (post) {
            const likerId = req.user._id.toString()
            const user = await User.findById(likerId)
            const likes = post.likes
            const likedOrNo = likes.find(liker => liker == likerId)
            if (likedOrNo) {
                likes.pull(likerId)
                user.likes.pull(postId)
            } else {
                likes.push(likerId)
                user.likes.push(postId)
            }
            user.save()
            post.save()
            res.status(200).send({ message: "Done" })
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
};

// Comment control

export const getAllComments = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId)

        if (post) {
            return res.status(201).send({ comments: post.comments })
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
};

export const commentOnPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId)
        const comment = req.body.comment

        if (post) {
            const userId = req.user._id.toString()
            const postComments = post.comments
            if (comment) {
                postComments.push({ userId, comment, replies: [] })
            } else {
                res.status(401).send({ message: "Enter a comment" })
            }
            post.save()
            res.status(200).send({ message: "Commented" })
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
};

export const getComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const postId = req.params.postId

        const post = await Post.findById(postId)

        if (post) {
            const comment = post.comments.find(comment => comment._id == commentId)
            if (comment) {
                post.save()
                res.status(200).send({ comment })
            } else {
                res.status(401).send({ message: "Comment not found" })
            }
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
}

export const replyToComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const postId = req.params.postId
        const reply = req.body.reply
        const userId = req.user._id.toString()
        const post = await Post.findById(postId)

        if (post) {
            const comment = post.comments.find(comment => comment._id == commentId)
            if (comment) {
                if (reply) {
                    comment.replies.push({
                        reply,
                        userId
                    })
                    await post.save()
                    res.status(200).send({ message: "Reply added" })
                } else {
                    return res.status(400).send({ message: "Enter a reply!" })
                }
            } else {
                res.status(401).send({ message: "Comment not found" })
            }
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
}

export const deleteComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const postId = req.params.postId
        const userId = req.user._id.toString()
        const post = await Post.findById(postId)

        if (post) {
            const comment = post.comments.find(comment => comment._id.toString() == commentId.toString())
            if (comment) {
                if (userId !== comment.userId.toString() || post.owner._id !== comment.userId.toString()) {
                    return res.status(401).send({ message: "You are not the post owner" });
                }

                post.comments.pull(commentId)
                await post.save()
                res.status(200).send({ message: "Comment deleted" })
            } else {
                res.status(401).send({ message: "Comment not found" })
            }
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
}

export const editComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const postId = req.params.postId

        const post = await Post.findById(postId)

        if (post) {
            const comment = post.comments.find(comment => comment._id == commentId)
            if (comment) {
                if (req.user._id.toString() !== comment.userId.toString()) {
                    return res.status(401).send({ message: "You are not the post owner" });
                }
                const newComment = req.body.comment
                if (newComment) {
                    comment.comment = newComment
                    await post.save()
                    res.status(202).send({
                        message: "Comment edited"
                    })
                }
                else {
                    return res.status(200).send({ message: "Comment can't be empty!" })
                }
            } else {
                res.status(401).send({ message: "Comment not found" })
            }
        } else {
            res.send({ message: "Post not found" })
        }
    } catch (error) {
        next(error);
    }
}