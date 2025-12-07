import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' })

    return res.status(200)
    .cookie("token", token, { 
        httpOnly: true, 
        sameSite: 'none', // ✅ CHANGE: Must be 'none' for Render
        secure: true,     // ✅ CHANGE: Must be true for Render
        maxAge: 24 * 60 * 60 * 1000 
    }).json({
        success : true,
        message,
        user,
        token // ✅ CHANGE: Send token to frontend so Redux can save it
    })
}