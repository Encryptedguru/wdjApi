const mongoose = require("mongoose");
const { Schema } = mongoose;


const commentSchema = new Schema({
    comment: {
        type: String,
        required: [true, "Comment is required"]
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article"
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    edited: {
        type:Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})



module.exports = mongoose.model("Comment", commentSchema);