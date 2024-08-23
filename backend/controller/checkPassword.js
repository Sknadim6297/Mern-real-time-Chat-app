const UserModel = require("../models/UserModel");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function checkPassword(request, response) {
    try {
        const { password, userId } = request.body;

        if (!password || !userId) {
            return response.status(400).json({
                message: "Missing required fields",
                error: true
            });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true
            });
        }

        const verifyPassword = await bcryptjs.compare(password, user.password);

        if (!verifyPassword) {
            return response.status(400).json({
                message: "Incorrect password",
                error: true
            });
        }

        const tokenData = {
            id: user._id,
            email: user.email
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECREAT_KEY, { expiresIn: '1d' });

        const cookieOptions = {
            httpOnly: true,
            secure: true, 
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000 
        };

        return response.cookie('token', token, cookieOptions).status(200).json({
            message: "Login successful",
            token: token,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true
        });
    }
}

module.exports = checkPassword;
