import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }

        // Match whatever key your Login controller uses (id or userId)
        req.id = decode.userId || decode.id;
        next();

    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({
            message: "Authentication failed",
            success: false
        });
    }
}

export default isAuthenticated;