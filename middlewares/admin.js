const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your_jwt_secret_key';

module.exports.isAdmin = (req, res, next) => {
    const token = req.cookies.adminAuthToken;
    // console.log("admin",req.cookies)
    
    if (!token) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token expired.' });
            }
            return res.status(403).json({ success: false, message: 'Invalid token.' });
        }
        
        req.user = user;
        next();
    });
};
