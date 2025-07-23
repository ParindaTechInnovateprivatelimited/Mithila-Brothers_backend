const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Address = require('../../Models/user/Address');
const mongoose = require('mongoose');
const Order = require('../../Models/user/Order');

router.post('/address', auth, async (req, res) => {
    const { firstName, lastName, addressLine1, addressLine2, city, state, code, phone, email } = req.body;

    try {
        const userId = req.user.id;


        const newAddress = new Address({
            userId,
            firstName,
            lastName,
            addressLine1,
            addressLine2,
            city,
            state,
            code,
            phone,
            email
        });

        await newAddress.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to add address',
            error: error.message
        });
    }
});

router.get('/address', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await Address.find({ userId });

        res.status(200).json({
            success: true,
            message: 'Address fetched successfully',
            data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve addresses',
            error: error.message
        });
    }
});

router.put('/address/:id', auth, async (req, res) => {
    const addressId = req.params.id;
    const { firstName, lastName, addressLine1, addressLine2, city, state, code, phone, email } = req.body;
    try {
        const userId = req.user.id;
        const address = await Address.findOneAndUpdate(
            { _id: addressId, userId },
            { firstName, lastName, addressLine1, addressLine2, city, state, code, phone, email },
            { new: true }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found or not authorized'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update address',
            error: error.message
        });
    }
});

router.delete('/address/:id', auth, async (req, res) => {
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid address ID'
        });
    }

    try {
        const userId = req.user.id;

        const orderWithAddress = await Order.findOne({
            userId: userId,
            shippingAddress: addressId
        });

        if (orderWithAddress) {
            return res.status(400).json({
                success: false,
                message: 'This address is used in an order and cannot be deleted'
            });
        }

        const address = await Address.findOneAndDelete({ _id: addressId, userId });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found or not authorized'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete address',
            error: error.message
        });
    }
});

module.exports = router;

