
const counter  = (req, res, next) => {
    
    req.count = 0;
    req.body.articleImages;
    req.body.articleImage;

    if(req.article && req.article.articleImages && req.article.articleImages.length > 0) {
        req.count = req.article.articleImages.length;
    }
    
    next()
}


module.exports = counter;