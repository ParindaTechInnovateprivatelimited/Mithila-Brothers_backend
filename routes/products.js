const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const auth = require('../middlewares/productupdate');
const User = require('../Models/user/User')

router.get('/', auth, async (req, res) => {
    const { categoryId, subCategoryId, size, color, lowPrice, highPrice, sorting, page = 0, limit = 9 } = req.query;
    let userId = null;
    let user = null;

    if (req.user) {
        user = await User.findOne({ firebaseId: req.user.uid });
        userId = user._id;
    }

    let filter = {};

    if (categoryId) filter.categoryId = categoryId;
    if (subCategoryId) filter.subCategoryId = subCategoryId;
    if (size) filter.size = size;
    if (color) filter['color.name'] = color;
    if (lowPrice || highPrice) {
        filter.price = {};
        if (lowPrice) filter.price.$gte = parseFloat(lowPrice);
        if (highPrice) filter.price.$lte = parseFloat(highPrice);
    }

    try {
        let sortOption = {};
        if (sorting === 'highToLow') sortOption.price = -1;
        if (sorting === 'lowToHigh') sortOption.price = 1;
        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(page * limit)
            .limit(parseInt(limit));

        let colorsArray = [];

        if (userId) {
            const wishlist = user ? user.wishlist : [];
            const updatedProducts = products.map(product => ({
                ...product.toObject(),
                isLiked: wishlist.includes(product._id) ? true : false,
            }));

            if (parseInt(page) === 0) {
                let colorFilter = {};

                if (subCategoryId && subCategoryId.trim().length > 0) {
                    colorFilter.subCategoryId = subCategoryId.trim();
                }
        
                if (categoryId && categoryId.trim().length > 0) {
                    colorFilter.categoryId = categoryId.trim();
                }
                const allProductsForColors = Object.keys(colorFilter).length > 0
                        ? await Product.find(colorFilter)
                        : await Product.find({});

                colorsArray = allProductsForColors.map(product => product.color);

                colorsArray = [...new Map(colorsArray.map(item => [item.name.toLowerCase() + item.colorCode, item])).values()];
            }
            
            return res.status(200).json({
                success: true,
                message: 'Product Fetched Successfully.',
                data: {
                    products: updatedProducts,
                    colors: colorsArray,
                    pagination: {
                        currentPage: parseInt(page),
                        itemsPerPage: parseInt(limit),
                        totalItems: await Product.countDocuments(filter),
                    }
                }
            });
        } else {

            if (parseInt(page) === 0) {
                let colorFilter = {};

                if (subCategoryId && subCategoryId.trim().length > 0) {
                    colorFilter.subCategoryId = subCategoryId.trim();
                }
        
                if (categoryId && categoryId.trim().length > 0) {
                    colorFilter.categoryId = categoryId.trim();
                }
                const allProductsForColors = Object.keys(colorFilter).length > 0
                        ? await Product.find(colorFilter)
                        : await Product.find({});

                colorsArray = allProductsForColors.map(product => product.color);

                colorsArray = [...new Map(colorsArray.map(item => [item.name.toLowerCase() + item.colorCode, item])).values()];
            }

            return res.status(200).json({
                success: true,
                message: 'Product Fetched Successfully.',
                data: {
                    products: products,
                    colors: colorsArray,
                    pagination: {
                        currentPage: parseInt(page),
                        itemsPerPage: parseInt(limit),
                        totalItems: await Product.countDocuments(filter),
                    }
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message,
        });
    }
});



router.get('/newarrivals', auth, async (req, res) => {
    let userId = null;
    let user = null;

    if (req.user) {
        user = await User.findOne({ firebaseId: req.user.uid });
        userId = user._id;
    }

    try {
        // Find the latest 4 products
        const products = await Product.find()
            .sort({ createdAt: -1 })  // Sort by createdAt in descending order (newest first)
            .limit(4);                // Limit the result to 4 products

        if (userId) {
            const wishlist = user ? user.wishlist : [];
            const updatedProducts = products.map(product => ({
                ...product.toObject(),
                isLiked: wishlist.includes(product._id) ? true : false,
            }));

            return res.status(200).json({
                success: true,
                message: 'New Arrivals Products',
                data: updatedProducts,
            });
        }

        const updatedProducts = products.map(product => ({
            ...product.toObject(),
            isLiked: false,
        }));

        res.status(200).json({
            success: true,
            message: 'New Arrivals Products',
            data: updatedProducts,
        });
    } catch (error) {
        res.status(400).json({ error: 'Could not fetch new arrivals' });
    }
});




router.get('/trending', auth, async (req, res) => {

    let userId = null
    let user = null

    if (req.user) {
        user = await User.findOne({ firebaseId: req.user.uid });
        userId = user._id;
    }

    try {
        const products = await Product.find().limit(10);
        if (userId) {
            const wishlist = user ? user.wishlist : [];
            const updatedProducts = products.map(product => ({
                ...product.toObject(),
                isLiked: wishlist.includes(product._id) ? true : false,

            }));


            return res.status(200).json({
                success: true,
                message: 'Trending Products',
                data: updatedProducts
            });
        }

        const updatedProducts = products.map(product => ({
            ...product.toObject(),
            isLiked: false
        }));

        return res.status(200).json({
            success: true,
            message: 'Trending Products',
            data: updatedProducts
        });
    } catch (error) {
        res.status(400).json({ error: 'Could not fetch trending products' });
    }
});




router.get('/search', auth, async (req, res) => {
    const { query } = req.query;

    let userId = null;
    let user = null;

    if (req.user) {
        user = await User.findOne({ firebaseId: req.user.uid });
        userId = user._id;
    }

    try {
        const products = await Product.find({
            $or: [
                { productName: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') }
            ],
        }).populate('categoryId', 'name')
            .populate('subCategoryId', 'name');

        const filteredProducts = products.filter(product =>
            new RegExp(query, 'i').test(product.categoryId.name) ||
            new RegExp(query, 'i').test(product.subCategoryId.name)
        );

        const updatedProducts = filteredProducts.map(product => ({
            ...product.toObject(),
            isLiked: userId && user.wishlist.includes(product._id),
        }));

        res.status(200).json(updatedProducts);
    } catch (error) {
        res.status(400).json({ error: 'Search failed', details: error });
    }
});


router.get('/name', auth, async (req, res) => {
    const { productName, color, size } = req.query;
    let filter = {};
    let userId = null;
    let user = null;

    if (!productName) {
        return res.status(400).json({
            success: false,
            message: 'Product name is required'
        });
    }

    if (!color && !size) {
        return res.status(400).json({
            success: false,
            message: 'At least one of color or size must be provided'
        });
    }

    if (req.user) {
        user = await User.findOne({ firebaseId: req.user.uid });
        userId = user._id;
    }

    filter.productName = productName
    if (color) filter['color.name'] = color;
    if (size) filter.size = size;

    try {
        const product = await Product.findOne(filter);
        let isLiked = false;
        if (userId) {
            const wishlist = user ? user.wishlist : [];
            isLiked = wishlist.includes(product._id);
        }

        const matchingProducts = await Product.find({
            productName: product.productName,
            categoryId: product.categoryId,
            subCategoryId: product.subCategoryId
        });

        const colorsArray = matchingProducts.map(p => p.color);
        const uniqueColors = [...new Map(colorsArray.map(item => [item.name.toLowerCase() + item.colorCode, item])).values()];


        return res.status(200).json({
            success: true,
            message: 'Product Fetched By Name Successfully.',
            data: {
                product: {
                    ...product.toObject(),
                    isLiked: isLiked
                },
                colors: uniqueColors
            }
        });


    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Filter search failed',
            error: error.message
        });
    }
});



router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;
    let userId = null;
    let user = null;

    if (req.user) {
        user = await User.findOne({ firebaseId: req.user.uid });
        userId = user ? user._id : null;
    }

    try {
        const product = await Product.findOne({ _id: id });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let isLiked = false;
        if (userId && user) {
            const wishlist = user.wishlist || [];
            isLiked = wishlist.includes(product._id);
        }

        const matchingProducts = await Product.find({
            productName: product.productName,
            categoryId: product.categoryId,
            subCategoryId: product.subCategoryId
        });

        const colorsArray = matchingProducts.map(p => p.color);
        const uniqueColors = [...new Map(colorsArray.map(item => [item.name.toLowerCase() + item.colorCode, item])).values()];

        return res.status(200).json({
            success: true,
            message: 'Product fetched successfully.',
            data: {
                product: {
                    ...product.toObject(),
                    isLiked: isLiked
                },
                colors: uniqueColors
            }
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Could not fetch product',
            error: error.message
        });
    }
});





module.exports = router;
