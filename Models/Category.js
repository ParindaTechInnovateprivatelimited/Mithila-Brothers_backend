const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    quantity: { type: Number },
    subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
