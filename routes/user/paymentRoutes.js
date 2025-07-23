const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const crypto = require('crypto');
const User = require('../../Models/user/User');
const Cart = require('../../Models/user/Cart');
const Order = require('../../Models/user/Order');
const Product = require('../../Models/Product');
const Address = require('../../Models/user/Address');


const merchantKey = process.env.MERCHANT_KEY
const SALT_KEY = process.env.SALT_KEY
const PAYU_BASE_URL = process.env.PAY_BASE_URL;
const surl = process.env.S_URL
const furl = process.env.F_URL;

router.post('/payment', auth, async (req, res) => {
    try {
        const { totalAmount, productInfo, userId, orderId, address } = req.body;

        if (!totalAmount || !productInfo) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: totalAmount or productInfo'
            });
        }

        const txnId = "TXN" + Date.now();

        const user = await User.findOne({ firebaseId: req.user.uid });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        const params = {
            key: merchantKey,
            txnid: txnId,
            amount: `${totalAmount}`,
            productinfo: productInfo,
            firstname: user.firstName,
            lastname: user.lastName || '',
            address1: address.addressLine1 || '',
            address2: address.addressLine2 || '',
            city: address.city || '',
            state: address.state || '',
            country: address.country || '',
            zipcode: address.code || '',
            email: address.email,
            udf1: orderId,
            udf2: userId,
            udf3: '',
            udf4: '',
            udf5: '',
            surl: surl,
            furl: `${furl}/${orderId}`,
        };

        const hash = generateHash(params, SALT_KEY);
        if (!hash) {
            return res.status(500).json({
                success: false,
                message: 'Error generating hash'
            });
        }

        params["hash"] = hash;
        const paymentData = {
            key: merchantKey,
            txnId,
            totalAmount,
            productinfo: productInfo,
            firstname: user.firstName,
            lastname: user.lastName || '',
            address1: address.addressLine1 || '',
            address2: address.addressLine2 || '',
            city: address.city || '',
            state: address.state || '',
            country: address.country || '',
            zipcode: address.code || '',
            email: address.email,
            phone: address.phone || '',
            surl,
            furl,
            hash: hash,
            service_provider: 'payu_paisa',
        };

        res.status(200).json({
            success: true,
            paymentData,
            url: `${PAYU_BASE_URL}/_payment`,
            message: 'Payment details generated successfully'
        });

    } catch (error) {
        console.error('Error processing payment:', error.message);

        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the payment',
            error: error.message
        });
    }
});

function generateHash(params, salt) {
    try {
        const hashString = [
            params["key"],
            params["txnid"],
            params["amount"],
            params["productinfo"],
            params["firstname"],
            params["email"],
            params["udf1"] || '',
            params["udf2"] || '',
            params["udf3"] || '',
            params["udf4"] || '',
            params["udf5"] || '',
            '', '', '', '', '',
            salt
        ].join('|');
        return sha512(hashString);
    } catch (error) {
        console.error('Error generating hash:', error.message);
        return null;
    }
}

function sha512(str) {
    return crypto.createHash("sha512").update(str).digest("hex");
}


router.post('/payment/success', async (req, res) => {
    const payUResponse = req.body;
    console.log('successResponse', payUResponse)
    if (payUResponse.status === 'success') {
        try {
            let cart = await Cart.findOne({ userId: payUResponse.udf2 });
            if (cart) {
                await Cart.findByIdAndDelete(cart._id);
            } else {
                console.log('Cart Not Found');
            }
            let order = await Order.findOne({ _id: payUResponse.udf1 });
            if (!order) {
                console.log('Order not Found');
                // return res.status(404).json({ message: 'Order not found' });
            }

            order.transactionId = payUResponse.txnid;
            order.status = 'Received';
            await order.save();

            for (const item of order.items) {
                // console.log(item)
                const product = await Product.findById(item.productId);
                // console.log(product)

                if (product) {
                    product.stock -= item.quantity;
                    product.saleValue = (product.saleValue || 0) + item.quantity;
                    await product.save();
                } else {
                    console.log(`Product not found for ID: ${item.productId}`);
                }
            }

            res.sendStatus(200);
        } catch (error) {
            console.error('Error processing payment and updating order:', error);
            // res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        console.error('Invalid payment status or hash response');
        // res.status(400).json({ message: 'Invalid payment status' });
    }
});



router.post('/payment/failure', (req, res) => {
    const payUResponse = req.body;
    const hashString = `${SALT_KEY}|${payUResponse.status}|${payUResponse.email}|${payUResponse.firstname}|${payUResponse.productinfo}|${payUResponse.amount}|${payUResponse.txnid}|${merchantKey}`;
    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    console.log('Payment failed:', payUResponse);
    if (generatedHash === payUResponse.hash) {
        console.log('Payment failed:', payUResponse);
    } else {
        console.error('Invalid hash response');
    }

    res.sendStatus(200);
});

router.post('/success', async (req, res) => {
    try {
        const paymentData = req.body;
        res.redirect(`http://elitezone.in/result?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
    } catch (error) {
        console.log(error)
    }
});

router.post('/failure', async (req, res) => {
    try {
        const paymentData = req.body;
        res.redirect(`http://elitezone.in/result?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
    } catch (error) {
        console.log(error)
    }
});
module.exports = router;