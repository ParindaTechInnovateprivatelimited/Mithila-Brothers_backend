const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Cart = require('../../Models/user/Cart')

router.post('/cart', auth, async (req, res) => {
    const { productId, size, quantity } = req.body;

    try {
        const userId = req.user.id;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({
                userId: userId,
                items: [],
                subtotal: 0,
                shippingCharges: 0,
                total: 0
            });
        }
        
        const existingItem = cart.items.find(
            item => item.productId.toString() === productId && item.size === size && item.quantity === quantity
        );

        const existingItemWithDifferentSize = cart.items.find(
            item => item.productId.toString() === productId && item.size !== size
        );

        const existingItemWithDifferentQuantity = cart.items.find(
            item => item.productId.toString() === productId && item.size === size && item.quantity !== quantity
        );

        if (existingItem) {
            await cart.save();
            return res.status(200).json({
                success: true,
                message: 'Product already exists in the cart',
            });
        } else if (existingItemWithDifferentQuantity) {
            existingItemWithDifferentQuantity.quantity += quantity;
            await cart.save();
            return res.status(200).json({
                success: true,
                message: 'Product quantity updated in the cart',
            });
        } else if (existingItemWithDifferentSize) {
            cart.items.push({ productId, size, quantity });
            await cart.save();
            return res.status(200).json({
                success: true,
                message: 'Product added to the cart with a different size'
            });
        } else {
            cart.items.push({ productId, size, quantity });
            await cart.save();
            return res.status(200).json({
                success: true,
                message: 'Product added to cart'
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Could not add product to cart',
            error: error.message
        });
    }
});



router.get('/cart', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        res.status(200).json({
            success: true,
            message: "User cart items retrieved successfully",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Could not fetch cart items',
            error: error.message
        });
    }
});



router.patch('/cart/:productId', auth, async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        const cartItem = cart.items.find(item => item._id.toString() === productId);

        if (cartItem) {
            cartItem.quantity = quantity;

            await cart.save();

            res.status(200).json({
                success: true,
                message: 'Cart Item updated Successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Item not found in cart',
                error: error.message
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Could not update cart',
            error: error.message
        });
    }
});


router.delete('/cart/:productId', auth, async (req, res) => {
    const { productId } = req.params;
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        const cartItem = cart.items.find(item => item._id.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            });
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== productId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart Successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Could not remove item from cart',
            error: error.message
        });
    }
});



module.exports = router;
