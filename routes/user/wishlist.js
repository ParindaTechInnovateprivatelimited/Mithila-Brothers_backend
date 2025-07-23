const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const User = require('../../Models/user/User');
const Product = require('../../Models/Product')


router.put('/wishlist/:productId', auth, async (req, res) => {
    const { productId } = req.params;

    try {
        const user = await User.findOne({ firebaseId: req.user.uid });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.wishlist.includes(productId)) {
            return res.status(200).json({
                success: true,
                message: 'Item already exists in wishlist'
            });
        }

        user.wishlist.push(productId);
        await user.save();


        return res.status(200).json({
            success: true,
            message: 'Item added to wishlist successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An error occurred while adding the item to the wishlist',
            error: error.message
        });
    }
});


router.get('/wishlist', auth, async (req, res) => {
    const { page = 0, limit = 10 } = req.query;

    try {
        const user = await User.findOne({ firebaseId: req.user.uid }).populate({
            path: 'wishlist',
            options: {
                skip: (page) * limit,
                limit: parseInt(limit)
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const userWishlist = await User.findOne({ firebaseId: req.user.uid }).select('wishlist').lean();
        const totalWishlistItems = userWishlist.wishlist.length;

        if (totalWishlistItems === 0) {
            return res.status(200).json({
                success: true,
                message: 'No wishlist items found for the user',
                data: [],
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: parseInt(limit)
                }
            });
        }

        const totalItems = await User.findOne({ firebaseId: req.user.uid })
            .select('wishlist')
            .lean()
            .then((result) => result.wishlist.length);

        const totalPages = Math.ceil(totalItems / limit);

        if (!user.wishlist.length && page > totalPages - 1) {
            return res.status(200).json({
                success: true,
                message: 'No wishlist items on this page',
                data: [],
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    itemsPerPage: parseInt(limit)
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'User wishlist retrieved successfully',
            data: user.wishlist,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the wishlist',
            error: error.message
        });
    }
});




router.delete('/wishlist/:productId', auth, async (req, res) => {
    const { productId } = req.params;

    try {
        const user = await User.findOne({ firebaseId: req.user.uid });

        const productIndex = user.wishlist.findIndex(id => id.toString() === productId.toString());

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());

        await user.save();
        // await Product.findByIdAndUpdate(productId, { isLiked: false });

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist successfully',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while removing the product from wishlist',
            error: error.message
        });
    }
});




module.exports = router;
