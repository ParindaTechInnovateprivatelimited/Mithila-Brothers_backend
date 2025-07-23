const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


module.exports = async (req, res, next) => {
    const token = req.cookies.authToken;
    // console.log('user',req.cookies)
    if (!token) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });
        req.user = user;
        next();
    });
};
