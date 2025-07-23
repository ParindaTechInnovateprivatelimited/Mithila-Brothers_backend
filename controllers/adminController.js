const User = require('../Models/user/User');
const Product = require('../Models/Product');
const Order = require('../Models/user/Order');
const Cart = require('../Models/user/Cart');
const Offer = require('../Models/Offer');
const Admin = require('../Models/admin/User')

const admin = require('../firebase');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your_jwt_secret_key';


exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.find({
            stock: { $lt: 20 }
        }).select('_id productName stock price');
        const totalOrders = await Order.countDocuments();
        const totalCartItems = await Cart.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: "$items.quantity" }
                }
            }
        ]);
        const totalSales = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const overallTotalSales = totalSales.length > 0 ? totalSales[0].totalSales : 0;
        const totalItemsInCarts = totalCartItems.length > 0 ? totalCartItems[0].totalItems : 0;

        const newUsersToday = await User.countDocuments({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } });
        const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } });

        const pendingOrders = await Order.countDocuments({ status: { $ne: 'Delivered' } });
        const completedOrders = await Order.countDocuments({ status: 'Delivered' });

        const topSellingProducts = await Order.aggregate([
            { $unwind: "$items" },

            {
                $group: {
                    _id: "$items.productId",
                    totalQuantitySold: { $sum: "$items.quantity" }
                }
            },

            {
                $match: {
                    totalQuantitySold: { $gt: 5 }
                }
            },

            { $sort: { totalQuantitySold: -1 } },

            {
                $lookup: {
                    from: "Product",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },

            {
                $project: {
                    _id: 1,
                    totalQuantitySold: 1,
                    productDetails: { $arrayElemAt: ["$productDetails", 0] }
                }
            }
        ]);


        res.json({
            totalUsers,
            totalProducts,
            overallTotalSales,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalItemsInCarts,
            newUsersToday,
            ordersThisMonth,
            topSellingProducts,
            lowStockProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('firstName lastName email phone ');
        res.json({
            Success: true,
            message: 'User List Fetched Successfully',
            data: users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate('orders').populate('cart');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('categoryId', 'name')
            .select('productName images stock price saleValue size description')
            .sort({ createdAt: -1 });

        res.json({
            Success: true,
            message: 'Product Fetch Successfully',
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductDetails = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the product details by ID
        const product = await Product.findById(id);

        // If the product doesn't exist
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const peopleOrdered = await Order.find({ 'items.productId': id })
            .populate('userId', 'name email phone')
            .select('orderId user items status');

        const peopleOrderedWithQuantity = peopleOrdered.map(order => {
            const productItem = order.items.find(item => item.productId.toString() === id);
            return {
                orderId: order._id,
                user: order.userId,
                quantity: productItem ? productItem.quantity : 0
            };
        });

        res.status(200).json({
            success: true,
            product,
            peopleOrdered: peopleOrderedWithQuantity.length > 0 ? peopleOrderedWithQuantity : 'No orders found for this product'
        });
    } catch (error) {
        console.log(error)
        // Handle any server errors
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching product details',
            error: error.message
        });
    }
};



exports.getOrderDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id).populate('user').populate('items.product');
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFilteredOrders = async (req, res) => {
    const { filter } = req.query; // 'week', 'month', 'year'
    let dateFilter;

    switch (filter) {
        case 'week':
            dateFilter = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        case 'month':
            dateFilter = new Date(new Date().setMonth(new Date().getMonth() - 1));
            break;
        case 'year':
            dateFilter = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
            break;
        default:
            dateFilter = new Date(0);
    }

    try {
        const orders = await Order.find({ createdAt: { $gte: dateFilter } });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getOrderChartData = async (req, res) => {
    const last7DaysOrders = await Order.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } },
        { $group: { _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } }, orders: { $sum: 1 } } },
    ]);

    const orderStatusData = await Order.aggregate([
        { $group: { _id: "$status", value: { $sum: 1 } } }
    ]);

    res.json({ dailyOrdersData: last7DaysOrders, orderStatusData });
};

exports.createOffer = async (req, res) => {
    const offerData = req.body;
    try {
        const offer = new Offer(offerData);
        await offer.save();
        res.status(200).json({ Success: true, message: 'Offer Created', offer });
    } catch (error) {
        console.log(error)
        res.status(400).json({ Success: false, error: 'Could not create Offer' });
    }
}

exports.getOfferList = async (req, res) => {
    try {
        const offer = await Offer.find({});
        res.json({ Success: true, message: 'Offer Generated', offer });
    } catch (error) {
        res.status(500).json({ Success: false, message: error.message });
    }
}

exports.addProduct = async (req, res) => {

    const productData = req.body;
    try {
        const product = new Product(productData);
        await product.save();
        res.status(200).json({ message: 'Product added', product });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: 'Could not add product' });
    }
}

exports.updateProduct = async (req, res) => {
    const { productId } = req.params;
    const updates = req.body;

    try {
        const product = await Product.findOneAndUpdate({ productId }, updates, { new: true });
        res.status(200).json({ message: 'Product updated', product });
    } catch (error) {
        res.status(400).json({ error: 'Could not update product' });
    }
}

exports.deleteProduct = async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({
            Success: false,
            message: 'Product ID is required'
        });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                Success: false,
                message: 'Product not found'
            });
        }
        await Product.findByIdAndDelete(productId);
        res.status(200).json({
            Success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                Success: false,
                message: 'Invalid product ID format'
            });
        }
        res.status(500).json({
            Success: false,
            message: 'An error occurred while deleting the product'
        });
    }
};


exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .select('_id totalAmount status createdAt')
            .populate('shippingAddress', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({ Success: true, message: 'Orders fetched Successfully', data: orders });
    } catch (error) {
        res.status(400).json({ Success: false, message: 'Could not fetch Orders', error: error.message });
    }
}

exports.authAdmin = async (req, res) => {
    const { fbToken } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(fbToken);
        let user = await Admin.findOne({ firebaseId: decodedToken.uid });
        if (!user) {
            return res.status(400).json({
                success: false, message: 'Access not allowed!'
            })
            // user = new User({
            //     firebaseId: decodedToken.uid,
            //     email: decodedToken.email,
            //     firstName: decodedToken.name || 'First Name',
            //     lastName: decodedToken.lastName || 'Last Name',
            //     phone: decodedToken.phone || '',
            // });
            // await user.save();
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('adminAuthToken', token, {
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
        res.status(400).json({ success: false, error });
    }
}

exports.getAdmin = async (req, res) => {
    try {
        const user = await Admin.findOne({ _id: req.user.id });
        res.status(200).json({
            success: true,
            message: 'User Fetched successfully',
            data: user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Bad Request",
            error: error.message || "An error occurred",
            timestamp: new Date().toISOString()
        });
    }
}