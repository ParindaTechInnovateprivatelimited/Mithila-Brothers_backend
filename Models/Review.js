const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: String,
    order: Number,
});

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, required: true },
    images: [imageSchema]
}, { timestamps: true });


module.exports = mongoose.model('Review', reviewSchema);
