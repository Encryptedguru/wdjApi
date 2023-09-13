const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../utils/multerStorage");
const upload = multer({storage})
const counter =  require("../middleware/imgCount");

const authMid = require("../middleware/auth");
const fileMid = require("../middleware/updateMid");


const article = require("../controllers/Article")

//forward any routes with comments to comment router;
router.use("/:articleId/comments", require("./Comment"))

router.route("/") 
       .get(article.getArticles)
        .post(authMid.protect, authMid.authorize("master", "writer"), counter, upload.fields([{name: "articleImage", maxCount: 1}, {name: "articleImages", maxCount: 6}]), article.createArticle)
      
router.route("/:id")
      .post(authMid.protect, article.likeArticle)
      .patch(authMid.protect, authMid.authorize("master", "writer"), fileMid, counter, upload.fields([{name: "articleImage", maxCount: 1}, {name: "articleImages", maxCount: 6}]), article.updateArticle)
      .delete(authMid.protect, authMid.authorize("master", "writer"), article.deleteArticle);

router.route("/view/:id")
      .post(article.view);
      
router.route("/:slug")
      .get(article.getArticle)

module.exports = router;