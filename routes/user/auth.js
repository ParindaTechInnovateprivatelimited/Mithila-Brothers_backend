const express = require('express');
const router = express.Router();
const admin = require('../../firebase');
const User = require('../../Models/user/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/auth', async (req, res) => {
    const { fbToken } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(fbToken);
        let user = await User.findOne({ firebaseId: decodedToken.uid });
        if (!user) {
            const fullName = decodedToken.name;
            const [firstName, lastName] = fullName.split(' ');
            user = new User({
                firebaseId: decodedToken.uid,
                email: decodedToken.email,
                firstName: firstName || 'First Name',
                lastName: lastName || '',
                phone: decodedToken.phone || null,
                address: 'Default Address',
                pincode: null,
            });
            await user.save();
        }

        const token = jwt.sign({ uid: decodedToken.uid, id: user._id, email: user.email, }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    pincode: user.pincode,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                token
            }
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
