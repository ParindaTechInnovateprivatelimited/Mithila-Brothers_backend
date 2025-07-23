const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: String,
    order: Number,
});

const colorSchema = new mongoose.Schema({
    name: String,
    colorCode: String
});

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    color: colorSchema,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    stock: { type: Number, required: true },
    saleValue: { type: Number, default: 0 },
    inStock: { type: Boolean },
    size: { type: [String], required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isLiked: { type: Boolean, default: false },
    images: [imageSchema],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
}, { timestamps: true });


productSchema.pre('save', function (next) {
    if (this.stock === 0) {
        this.inStock = false;
    } else {
        this.inStock = true;
    }
    next();
});

productSchema.pre(/^find/, function (next) {
        this.populate('offer');
    next();
});

module.exports = mongoose.model('Product', productSchema);
