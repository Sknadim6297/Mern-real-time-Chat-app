async function logout(request, response) {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure cookies in production
            sameSite: 'None',
            expires: new Date(0) // Set expiration date to the past
        };

        return response.cookie('token', '', cookieOptions).status(200).json({
            message: "Session ended",
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true
        });
    }
}

module.exports = logout;
