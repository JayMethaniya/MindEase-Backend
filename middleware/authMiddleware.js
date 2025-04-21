const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ 
                success: false,
                message: 'Admin not found' 
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false,
            message: 'Invalid token' 
        });
    }
};

module.exports = authMiddleware; 