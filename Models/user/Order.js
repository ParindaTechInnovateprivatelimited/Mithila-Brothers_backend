const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    paymentMethod: { type: String, enum: ['COD', 'Prepaid'], default: 'COD', required: true },
    subtotalAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    transactionId: { type: String, default: 'N/A' },
    shippingCharge: { type: Number },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
        finalPrice: { type: String, required: true },
        originalPrice: { type: String, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Received', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Received'
        },
    }],
    status: {
        type: String,
        enum: ['Pending', 'Received', 'Created', 'Processing', 'Delivered', 'Cancelled'],
        default: 'Created'
    },
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
    if (this.isModified('status')) {
        if (this.status === 'Created') {
            this.items.forEach(item => {
                item.status = 'Received';
            });
        } else if (this.status === 'Received') {
            this.items.forEach(item => {
                item.status = 'Processing';
            });
        } else if (this.status === 'Processing') {
            this.items.forEach(item => {
                item.status = 'Pending';
            });
        }
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

