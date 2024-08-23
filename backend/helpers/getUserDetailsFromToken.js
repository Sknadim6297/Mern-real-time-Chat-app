const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return {
            message: "Session out",
            logout: true,
        };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECREAT_KEY);

        const user = await UserModel.findById(decoded.id).select('-password');

        if (!user) {
            return {
                message: "User not found",
                logout: true,
            };
        }

        return user;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                message: "Token expired",
                logout: true,
            };
        }
        if (error.name === 'JsonWebTokenError') {
            return {
                message: "Invalid token",
                logout: true,
            };
        }
        return {
            message: "An error occurred",
            logout: true,
        };
    }
};

module.exports = getUserDetailsFromToken;
