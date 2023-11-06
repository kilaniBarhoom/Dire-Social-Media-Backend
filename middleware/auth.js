import jwt from "jsonwebtoken";
import User from "../modals/user.js";

const auth = async (req, res, next) => {
    let accessToken = null;
    if (req.headers.authorization) {
        accessToken = req.headers.authorization.split(" ")[1];
    }
    if (!accessToken) {
        return res.status(401).send({ message: "Not authorized" });
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(404).send({ message: "User account was deleted" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).send({ message: "Not authorized" });
    }
};

export default auth;