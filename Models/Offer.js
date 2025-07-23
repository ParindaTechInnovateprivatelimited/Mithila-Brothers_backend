const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    offerName: { type: String, required: true },
    offerDescription: { type: String },
    offerType: { type: String, required: true, enum: ['percentOff', 'offerPrice'] },
    percentOff: { type: Number, default: null },
    offerPrice: { type: Number, default: null }
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
