const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePhoto: { type: String, default: '' },
    phone: { type: String,default: null },
}, { timestamps: true });

const User = mongoose.model('UserAdmin', userSchema);

module.exports = User;
