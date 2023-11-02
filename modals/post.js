import mongoose from "mongoose";

const replySchema = mongoose.Schema({
    text: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who posted the reply
    createdAt: { type: Date, default: Date.now },
});

const commentSchema = mongoose.Schema({
    text: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who posted the comment
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema], // An array of replies
});

const postSchema = mongoose.Schema(
    {
        img: String,
        text: String,
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // An array of user IDs who liked the post
        comments: [commentSchema], // An array of comments
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
