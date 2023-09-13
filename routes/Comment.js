const express = require("express");
const router = express.Router({mergeParams: true});
const authMid = require("../middleware/auth");


const comment = require("../controllers/Comment");

router.route("/")
      .post(authMid.protect, comment.create)
      .get(comment.getComments);

router.route("/:id")
      .patch(authMid.protect, comment.updateComment)
      .delete(authMid.protect, authMid.authorize("master", "user"), comment.deleteComment)

module.exports = router