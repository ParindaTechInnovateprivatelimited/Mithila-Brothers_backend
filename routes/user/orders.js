const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Order = require('../../Models/user/Order');
const User = require('../../Models/user/User');
const Address = require('../../Models/user/Address');
const Cart = require('../../Models/user/Cart');


router.post('/', auth, async (req, res) => {
    const data = req.body;
    try {
        const user = await User.findOne({ firebaseId: req.user.uid });
        const address = await Address.findOne({ _id: data.shippingAddress });

        if (!address) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        const order = new Order({
            userId: req.user.id,
            ...data
        });
        await order.save();

        if (data.paymentMethod === 'COD') {

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            order.status = 'Received';
            await order.save();

            let cart = await Cart.findOne({ userId: req.user.id });
            if (cart) {
                await Cart.findByIdAndDelete(cart._id);
                console.log(`Cart for user ${req.user.id} has been deleted.`);
            } else {
                return res.status(404).json({ message: "Cart not found" });
            }
        }

        res.status(200).json({ Success: true, message: 'Order placed successfully', data: { id: order._id, totalAmount: order.totalAmount, items: order.items } });
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Could not place order', error });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.productId')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            Success: true,
            message: 'Order Fetched Successfully',
            data: orders
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Could not fetch orders' });
    }
});


router.get('/:id', auth, async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId, userId: req.user.id })
            .populate('items.productId')
            .populate('shippingAddress');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({
            Success: true,
            message: 'Order fetched successfully',
            data: order
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Could not fetch order' });
    }
});

module.exports = router;
