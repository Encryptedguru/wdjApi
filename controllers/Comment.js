const Comment = require("../models/Comment");
const Article = require("../models/Article")
const wrapAsync = require("../utils/wrapAsync");
const ServerError = require("../utils/error");
const authMid = require("../middleware/auth");


const comment = Object.create(null);


comment.create = wrapAsync(async(req, res, next) => {
    const { articleId } = req.params;

    const article = await Article.findById(articleId);

    if(!article) {
        return next(new ServerError(400, "No article to comment"));
    }

    req.body.article = articleId;
    req.body.author = req.user._id

    let comment = await Comment.create(req.body);
    comment = await Comment.findById(comment._id).populate("author", "username avatar role")
    res.status(201).json({success: true, comment});
})

//get all comments for an article

comment.getComments = wrapAsync(async (req, res, next) => {
    const { articleId } = req.params;

    // console.log(req.params);

    const article = await Article.findById(articleId);

    if(!article) {
        return next(new ServerError(400, "No article to read from"))
    }

    const comments = await Comment.find({article: articleId}).populate("author", "avatar username");

    res.status(200).json({success: true, comments});
})

//update comment

comment.updateComment = wrapAsync(async (req, res, next) => {
    const { articleId, id } = req.params;

    const article = await Article.findById(articleId);

    if(!article) {
        return next(new ServerError(400, "No article to update comment"))
    }

    let comment = await Comment.findById(id);

    if(!comment) {
        return next(new ServerError(400, "No comment to update"))
    }

    if(req.user._id.toString() !== comment.author.toString() && req.user.role != "master") {
        return next(new ServerError(403, "You are forbidden from this action"));
    }

    req.body.edited = true;

    comment = await Comment.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});

    res.status(200).json({success: true, comment});
})


comment.deleteComment = wrapAsync(async (req, res, next) => {
    const {articleId, id} = req.params;
    
    const article = await Article.findById(articleId);

    if(!article) {
        return next(new ServerError(400, "No article to delete comment"))
    }
    let comment = await Comment.findById(id);

    if(!comment) {
        return next(new ServerError(400, "No comment to delete"));
    }

   
    if(req.user._id.toString() !== comment.author.toString() && req.user.role != "master" ) {
        return next(new ServerError(403, "You are forbidden from this action cc"));
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({success: true}); 
})
module.exports = comment;