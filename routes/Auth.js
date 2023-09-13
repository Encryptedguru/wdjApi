const express = require("express");
const router  = express.Router();
const multer = require("multer");
const storage = require("../utils/multerStorage");
const auth = require("../controllers/Auth");

const authMid = require("../middleware/auth");

const upload = multer({storage})

router.route("/:id")
      .patch(authMid.protect, authMid.authorize("user", "master", "writer"), upload.single("avatar"), auth.updateUser)
      .delete(authMid.protect, authMid.authorize("master"), auth.deleteUser);

router.route("/signup")
      .post(upload.single('avatar'), auth.signUp)

router.route("/login")
      .post(auth.login)

router.route("/confirmEmail/:tokenId")
      .get(auth.confirmEmail);

router.route("/getUsers")
      .get(auth.getUsers);

router.route("/forgotpassword")
      .post(auth.forgotPassword)

router.route("/resetpassword/:token")
      .post(auth.resetPassword);


router.route("/getMe")
      .get(authMid.protect, auth.getMe)


module.exports = router;