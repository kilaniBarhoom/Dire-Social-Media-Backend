import { Schema, model } from "mongoose";



const userSchema = Schema({
    userName: { type: String, unique: true, required: true, max: 15 },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, min: 3 },
    bio: { type: String, default: "" },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }], // An array of post IDs the user liked
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // An array of user IDs who follow this user
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }], // An array of user IDs this user follows
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }], // An array of post IDs by the user
}, { timestamps: true });

const User = model("User", userSchema);

export default User;
