const express = require('express');

const router = express.Router();
const { isAdmin } = require('../../middlewares/admin');
const { getStats, getUsers, getUserDetails, getProducts, getProductDetails, getOrders, getOrderDetails, getFilteredOrders, createOffer, addProduct, updateProduct, deleteProduct, authAdmin, getAdmin, getOfferList, getOrderChartData } = require('../../controllers/adminController');

router.get('/stats',isAdmin, getStats);

router.get('/users', isAdmin, getUsers);
router.get('/users/:id', isAdmin, getUserDetails);

router.get('/orders', isAdmin, getOrders);
router.get('/orders/filter', isAdmin, getFilteredOrders);
router.get('/orders/data',isAdmin, getOrderChartData);
router.get('/orders/:id', isAdmin, getOrderDetails);

router.post('/offer',isAdmin, createOffer)
router.get('/offer',isAdmin, getOfferList)

router.get('/products', isAdmin, getProducts);
router.get('/products/:id', isAdmin, getProductDetails);

router.post('/products', isAdmin, addProduct);
router.put('/products/:productId',isAdmin, updateProduct);
router.delete('/products/:productId',  isAdmin, deleteProduct);

router.post('/auth', authAdmin);
router.get('/user', isAdmin, getAdmin);


module.exports = router;
