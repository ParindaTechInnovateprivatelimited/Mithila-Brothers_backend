const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


module.exports = async (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token){
    return req.user = '',
        next()
    } ;
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return req.user = '',
        next();
        
        req.user = user;
        next();
    });
};


