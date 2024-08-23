const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      if (!password) {
        return res.status(400).send({ message: "Please provide password" });
      }
  
      const decode = jwt.verify(token, process.env.JWT_SECREAT_KEY);
  
      const user = await User.findOne({ email: decode.email });
  
      const hashPassword = await bcrypt.hash(password, 10);
  
      user.password = hashPassword;
      await user.save();
  
      return res.status(200).send({ message: "Password reset successfully" });
    } catch (error) {
      return res.status(500).send({ message: "Something went wrong" });
    }
  };


  module.exports = resetPassword;
  