import mongoose from "mongoose";

const replySchema = mongoose.Schema({
    text: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Reference to the post
    createdAt: { type: Date, default: Date.now },
});

const commentSchema = mongoose.Schema({
    text: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Reference to the post
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema], // An array of replies
});

const userSchema = mongoose.Schema({
    userName: { type: String, unique: true, required: true, max: 15 },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, min: 3 },
    status: { type: String, default: "public" },
    bio: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // An array of post IDs the user liked
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }], // An array of notification IDs
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // An array of user IDs who follow this user
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // An array of user IDs this user follows
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // An array of post IDs by the user
    comments: [commentSchema], // An array of comments and replies
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
