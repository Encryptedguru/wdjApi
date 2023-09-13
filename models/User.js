const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Comment = require("./Comment");
const Article = require("./Article");

const { Schema } =  mongoose;


const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "That name is already taken"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        
        unique: [true, "This email is already registered"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minLength: [6, "Atleast 6 characters for password"]
    },
    role: {
        type: String,
        default: "user"
    },
    avatar: {
        type: String,
        
    },
    emailConfirmed: {
        type: Boolean,
        default: false
    },
    likes: {
        type: Array
    },
    description: {
        type: String
    },
    confirmToken: {
        type: String
    },
    passwordResetToken: {
        type: String,
    },
    passwordTokenExpires: {
        type: Date,
    },
    userSince: {
        type: Date,
        default: Date.now()
    }
})


userSchema.pre("save", async function(next) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.pre("findOneAndRemove", async function(next) {
    await Comment.deleteMany({author: this._id});
    await Article.deleteMany({author: this._id});
    next();
})

userSchema.methods.passwordIsMatch = async function(password)  {

    return await bcrypt.compare(password, this.password);
}


userSchema.methods.signJWT = function() {

    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES})
    return token;
}

module.exports = mongoose.model("User", userSchema);