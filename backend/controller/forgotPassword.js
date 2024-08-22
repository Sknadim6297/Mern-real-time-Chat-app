const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).send({ message: "Please provide email" });
      }
  
      const checkUser = await User.findOne({ email });
  
      if (!checkUser) {
        return res
          .status(400)
          .send({ message: "User not found please register" });
      }
  
      const token = jwt.sign({ email }, process.env.JWT_SECREAT_KEY, {
        expiresIn: "1h",
      });
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.MY_GMAIL,
          pass: process.env.MY_PASSWORD,
        },
      });
  
      const receiver = {
        from: "SkChat@gmail.com",
        to: email,
        subject: "Password Reset Request",
        text: `Click on this link to generate your new password ${process.env.CLIENT_URL}/reset-password/${token}`,
      };
  
      await transporter.sendMail(receiver);
  
      return res.status(200).send({
        message: "Password reset link send successfully",
      });
    } catch (error) {
      return res.status(500).send({ message: "Something went wrong" });
    }
  };

module.exports = forgetPassword;