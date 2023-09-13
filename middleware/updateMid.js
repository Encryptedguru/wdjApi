
const wrapAsync = require("../utils/wrapAsync");
const ServerError = require("../utils/error");
const Article = require("../models/Article")

const fileMid = wrapAsync(async (req, res, next) => {
    const {id } = req.params;
    

     const article = await Article.findById(id);

     if(!article) {
        return next(new ServerError(404, "Article with given id does not exist"))
     }

     req.article = article;
   

    next();
})

module.exports = fileMid;