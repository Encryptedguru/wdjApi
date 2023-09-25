const Article = require("../models/Article")
const User = require("../models/User");
const slugify = require("slugify");
const wrapAsync = require("../utils/wrapAsync");
const ServerError = require("../utils/error");
const mongoose = require("mongoose")


const article = Object.create(null);
//@Todo
//@Todo authorize
//@add author
//create article
article.createArticle = wrapAsync(async (req, res, next) => {

    req.body.author = req.user._id;

    //create a slug
    req.body.slug = slugify(req.body.title, {lower: true, trim: true, strict: true})


    const article = await Article.create(req.body);

    res.status(200).json({success: true, article})
})


//@Todo
//@add paginate
//@add search query

article.getArticles = wrapAsync(async ( req, res, next) => {
    
    if(req.query && req.query.search && req.query.search !== "") {
        const articles = await Article.find({$text: {$search: req.query.search}})

        res.status(200).json({success: true, articles})
        return;
    }

    const articles = await Article.find({}).populate("author", "avatar username").sort({viewed: -1, liked: -1, createdAt: -1}).limit(9).populate({path: "comments", select: "comment"});

    res.status(200).json({success: true, articles})
})


//get article

article.getArticle = wrapAsync(async (req, res, next) => {
    const {slug} = req.params;

    const article = await Article.findOne({slug}).populate("author", "username avatar description").populate({path: "comments", options: {sort: {createdAt: -1}}, populate: {path: "author", select: "avatar username role"}});

    if(!article) {
        return next(new ServerError(404, `Article with id:${id} is not found`))
    }

    res.status(200).json({success: true, article});
})



//update an article
// Todo @authorize article
// 

article.updateArticle = wrapAsync(async(req, res, next) => {
    const {id} = req.params;


    let article = await Article.findById(id);
    
    //@Todo throw an error
    if(!article) {
        return next(new ServerError(404, `Cannot update article ${id} id`));
    }

    //forbid if logged in user is not owner or master
    if(req.user.role !== "master" && article.author.toString() !== req.user._id.toString()) {
        return next(new ServerError(403, "You are forbidden from this actioni"))
    }
    if(req.body.body) {
        req.body.body = article.parseBody(req.body.body);
    }

    req.body.lastUpdated = Date.now();

    article = await Article.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

    res.status(200).json({success: true, article})
})



//Delete article
//@ bubble to delete comments
//@ delete image and images associate with the article or run workers;

article.deleteArticle = wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    const article = await Article.findById(id);

    if(!article) {
        return next(new ServerError(404, `Could not delete ${id} article`))
    }

    //forbid if logged in user is not owner or master
    if(req.user.role !== "master" && article.author.toString() !== req.user._id.toString()) {
        return next(new ServerError(403, "You are forbidden from this action"))
    }

    await Article.findOneAndRemove({_id: id});

    res.status(200).json({success: true})
})


//like;
article.likeArticle = wrapAsync(async (req, res, next) => {
    const {id } = req.params;
    
    let article = await Article.findById(id);

    if(!article) {
        return next(new ServerError(404, "article not found"));
    }
    

    // if already liked unlike
    if(req.user.likes.includes(id)) {
         req.user.likes.pull(id)
         req.user.save({validateBeforeSave: false})
       article = await Article.findByIdAndUpdate(id, {$inc: {likes: -1}}, {runValidators: true, new: true}).populate("author", "username avatar description").populate({path: "comments", options: {sort: {createdAt: -1}}, populate: {path: "author", select: "avatar username role"}});
     
    } else {

        req.user.likes.push(id);
        req.user.save({validateBeforeSave: false});

        article = await Article.findByIdAndUpdate(id, {$inc: {likes: 1}}, {new: true, runValidators: true}).populate("author", "username avatar description").populate({path: "comments", options: {sort: {createdAt: -1}}, populate: {path: "author", select: "avatar username role"}});    
    }
      
    res.status(200).json({success: true, article, user: req.user})
})

//view article

article.view = wrapAsync(async(req, res, next) => {
    const { id } = req.params;
    let article = await Article.findById(id);

    if(!article) {
        return next(new ServerError(404, "No article to view"))
    }

    article = await Article.findByIdAndUpdate(id, {$inc: {viewed: 1}}, {runValidators: true, new: true});
 
    res.status(200).json({success: true, article});
})


module.exports = article;