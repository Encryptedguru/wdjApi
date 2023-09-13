const User = require("../models/User");
const jwt = require("jsonwebtoken");
const wrapAsync = require("../utils/wrapAsync");
const ServerError = require("../utils/error");



const auth = Object.create(null);

auth.protect = wrapAsync(async(req, res, next) => {
    let token;
    token = req.headers.authorization && req.headers.authorization.startsWith("Bearer") ? req.headers["authorization"].split(" ")[1] : false;

    if(!token) return next(new ServerError(401, "Login to continue"));

    const {id} = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(id);

    if(!req.user) {
        return next(new ServerError(401, "Login, to continue"))
    }

    next();
})


auth.authorize = (...roles) => {
    return wrapAsync(async(req, res, next) => {
        if(!roles.includes(req.user.role)) return next(new ServerError(403, "You are forbidden from this action"))

        next();
    })
}

module.exports = auth