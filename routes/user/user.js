const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const User = require('../../Models/user/User');


router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseId: req.user.uid });
        res.status(200).json({
            success: true,
            message: 'User Fetched successfully',
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                address: user.address,
                pincode: user.pincode,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Bad Request",
            error: error.message || "An error occurred",
            timestamp: new Date().toISOString()
        });
    }
});

router.patch('/', auth, async (req, res) => {
    try {
        const updatedData = req.body;
        const user = await User.findOneAndUpdate(
            { firebaseId: req.user.uid },
            updatedData,
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: 'User Updated successfully',
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
                    updatedAt: user.updatedAt,
                    profilePhoto: user.profilePhoto
                },
            }
        });
    } catch (error) {
        res.status(400).json({ error: 'Could not update profile' });
    }
});

module.exports = router;
