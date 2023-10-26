import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        max: 15
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 3
    }
}, { timestamps: true })

const user = mongoose.model("User", userSchema)

export default user;