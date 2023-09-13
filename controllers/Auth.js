const User = require("../models/User");
const wrapAsync = require("../utils/wrapAsync");
const ServerError = require("../utils/error");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const mailGen = require("mailgen");
const bcrypt = require("bcrypt")

const mailGenerator = new mailGen({
    theme: "default",
    product: {
        name: "Web Development Journal",
        link: "http//localhost:4200",
        logo: "http://localhost:5000/ArticleImages/trial-protect12-articleImages-2.png",
        logoHeight: "40px"
    }
})


const auth = Object.create(null)

//@Todo send email for confirmation 
// @Todo login user automatically after sign up / bring the login page

auth.signUp = wrapAsync(async (req, res, next) => {

    
    req.body.email = req.body.email.toLowerCase();
    let user = await User.findOne({email: req.body.email});

    if(user) {
        return next(new ServerError(400, `User with ${req.body.email} already exists`))
    }

    const token = crypto.randomBytes(25).toString("hex");

    req.body.confirmToken = crypto.createHmac("sha256", process.env.SERVER_KEY).update(token).digest("hex");
   
    user = await User.create(req.body)
    
    const confirmUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/confirmEmail/${token}`

    const mail = {
       
        body: {
            name: user.username,
            intro: "Welcome to WDJ World where we Code Create and Conquer, Great to join like minded web dev community",
            action: {
                instructions: "To get started confirm your email here ",
                button: {
                    color: "#22BC66",
                    text: "Confirm Email",
                    link: confirmUrl
                }
            }
        }
    }

    const mailBody = mailGenerator.generate(mail);

    require("fs").writeFileSync("preview.html", mailBody, 'utf-8');

    const mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Confirm Email For WDJ",
        html: mailBody
    }
   try {
        await sendMail(mailOptions);
    
   } catch (err) {
      return next(new ServerError(500, "email not sent"))
   } finally {

       sendTokenResponse(res, user, 201);
   }
    
})


//login user
//@Todo send token response
auth.login = wrapAsync(async(req, res, next) => {
  
    req.body.email = req.body.email.toLowerCase();
    const user = await User.findOne({email: req.body.email}).select("+password");

    if(!user) {
        return next(new ServerError(400, "Invalid logins, try again"));
    }

    const isMatch = await user.passwordIsMatch(req.body.password);

    if(!isMatch) return next(new ServerError(400, "Invalid logins, xtry again"));

    sendTokenResponse(res, user, 200);
})


//update user avatar and username //@email is unchangeable

auth.updateUser = wrapAsync(async (req, res, next)  => {
   
    const {id} = req.params;

   

    let user = await User.findById(id);

    if(!user) {
        return next(new ServerError(404, "User not found to update"));
    }
    
    //forbid if logged in user is not owner or role == master
    if(req.user.role !== "master" || user._id.toString() !== req.user._id.toString()) {
        return next(new ServerError(403, "You are forbidden from this action"))
    }
    
    if(req.body.email) {
        delete req.body.email
    }

    user = await User.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});

    res.status(200).json({success: true, user});
})


//delete user
//@Todo bubble to delete all comments and articles associated with the user

auth.deleteUser = wrapAsync(async (req, res, next) =>  {
    const id = req.params.id
    const user = await User.findById(id);

    if(!user) {
        return next(new ServerError(400, "User not found to delete"))
    }

      //forbid if logged in user is not owner or role == master
      if(req.user.role !== "master" || user._id.toString() !== req.user._id.toString()) {
        return next(new ServerError(403, "You are forbidden from this action"))
    }

    await User.findOneAndRemove({_id: id});

    res.status(200).json({success: true})
})

//get users 
//@admin
auth.getUsers = wrapAsync(async (req, res, next) => {
    const users = await User.find({});
    
    res.status(200).json({success: true, users});
})

//get me
//@ logged in user
auth.getMe = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if(!user) {
        return next(new ServerError(400, "Login to continue"));
    }
    res.status(200).json({success: true, user});
})
//public
//@Todo send the recipient an email
auth.forgotPassword = wrapAsync(async (req, res, next) => {
     
    const email = typeof req.body.email == "string" && req.body.email.length > 0 ? req.body.email : false;

    if(!email) {
        return next(new ServerError(400, "Missing Fields"))
    }
    
    const user = await User.findOne({email}).select("+password")

    if(!user) {
        return next(new ServerError(404, `user with ${req.body.email} does not exist in our databases`))
    }

    const token = crypto.randomBytes(30).toString("hex");

    user.passwordResetToken = crypto.createHmac("sha256", process.env.SERVER_KEY).update(token).digest("hex");
    user.passwordTokenExpires = Date.now() + (1000 * 60 * 20);

 
      user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/resetpassword/?token=${token}`

    const mail = {
       
        body: {
            name: user.username,
            intro: "We are sending this email because you (or someone) requested for a password reset for your account in WDJ",
            action: {
                instructions: "Ignore this email if it was not you",
                button: {
                    color: "#22BC66",
                    text: "Reset Password",
                    link: resetPasswordUrl
                }
            }
        }
    }

    const mailBody = mailGenerator.generate(mail);

    // require("fs").writeFileSync("preview.html", mailBody, 'utf-8');

    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Reset Password",
        html: mailBody
    }

     await sendMail(mailOptio-ns);
    //Send email to them with a 
    res.status(200).json({success: true, msg: "An email has been sent to your email account"})
})


//reset password
//@Todo reset password

auth.resetPassword = wrapAsync(async(req, res, next) => {
    const hashedToken = typeof req.params.token == "string" && req.params.token.length > 0 ? req.params.token : false;
    const password = typeof req.body.password == "string" && req.body.password.length > 0 ? req.body.password : false;

    if(!password || !hashedToken) {
        return next(new ServerError(400, "Missing Fields"))
    }

    const token = crypto.createHmac("sha256", process.env.SERVER_KEY).update(hashedToken).digest("hex");

    
    const user = await User.findOne({passwordResetToken: token}).select("+password");
   
    if(!user) {
        return next(new ServerError(404, `user does not exist`))
    }

    if(Date.now() > user.tokenExpires) {
        return next(new ServerError(400, `Password reset token has expired`))
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordTokenExpires = undefined;

    user.save({validateBeforeSave: false});
    
    res.status(200).json({success: true, msg: "login to WDJ"})
})


//confirmEmail
auth.confirmEmail = wrapAsync(async (req, res, next) => {
    const {tokenId} = req.params;
    const token = crypto.createHmac("sha256", process.env.SERVER_KEY).update(tokenId).digest("hex");
 
    if(!token) {
        return next(new ServerError(400, "Could not confirm Email"));
    }

    const user = await User.findOne({confirmToken: token}).select("+password");
   
   
    if(!user) {
        return next(new ServerError(400, "Could not confirm Email"))
    }

    user.emailConfirmed = true;
   
     user.save({ validateBeforeSave: false})
  
    sendTokenResponse(res, user, 200);
})


auth.isMatch = async function (string, hash) {
   return await bcrypt.compare(string, hash);
}

function sendTokenResponse(res, user, statusCode) {
    const token = user.signJWT();
     
    res.status(statusCode).json({success: true, user, token})
}

module.exports = auth;