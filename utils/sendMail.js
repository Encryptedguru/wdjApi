const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
})

const sendMail = async function (mailOptions) {

   const resp = await transporter.sendMail(mailOptions);

   return resp;
}

module.exports = sendMail;