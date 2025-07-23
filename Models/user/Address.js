const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, },
    city: { type: String, required: true },
    state: { type: String, required: true },
    code: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
}, { timestamps: true })

const Address = mongoose.model('Address', orderSchema);

module.exports = Address;