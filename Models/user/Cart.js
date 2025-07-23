const { ObjectId } = require('bson');
const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: ObjectId, ref: 'Product' },
        product: {
            id: { type: ObjectId, ref: 'Product' },
            productName: { type: String },
            image: { type: String },
            price: { type: Number }
        },
        offerId: { type: ObjectId, ref: 'Offer' },
        size: { type: String },
        quantity: { type: Number, default: 1 },
        discountPrice: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 }
    }],
    subtotal: { type: Number, default: 0, comment: "Holds total price of all the items in the cart" },
    shippingCharges: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
}, { timestamps: true });

const calculateDiscountPrice = (product) => {
    let discountPrice = product.price;
    if (product.offer) {
        const offer = product.offer;
        if (offer.percentOff) {
            discountPrice = product.price - (product.price * (offer.percentOff / 100));
        } else if (offer.offerPrice) {
            discountPrice = offer.offerPrice;
        }
    }
    return discountPrice;
};

cartSchema.methods.calculatePrices = async function () {
    await this.populate('items.productId');

    let subtotal = 0;

    for (const item of this.items) {
        const product = item.productId;
        const discountPrice = calculateDiscountPrice(product);
        item.discountPrice = discountPrice;
        item.product.id = product._id
        item.product.productName = product.productName;
        item.product.image = product.images && product.images.length > 0
            ? product.images[0].url
            : '';
        item.offerId = product.offer;
        item.product.price = product.price
        item.totalPrice = discountPrice * item.quantity;
        subtotal += item.totalPrice;
    }

    this.subtotal = subtotal;
    this.shippingCharges = (subtotal > 0 && subtotal < 2000) ? 70 : 0;
    this.total = this.subtotal + this.shippingCharges;
};


cartSchema.pre('save', async function (next) {
    await this.calculatePrices();
    this.updatedAt = Date.now();
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
