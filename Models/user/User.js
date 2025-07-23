const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseId: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    profilePhoto: { type: String, default: '' },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    phone: { type: String },
    pincode: { type: Number },
    address: { type: String },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

module.exports = User;
