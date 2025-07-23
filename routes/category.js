const express = require('express');
const router = express.Router();
const Category = require('../Models/Category');
const SubCategory = require('../Models/SubCategory');
const { isAdmin } = require('../middlewares/admin');
const Product = require('../Models/Product');

router.post('/', isAdmin, async (req, res) => {
    const { name } = req.body;
    try {
        const category = new Category({
            name
        });
        await category.save();
        res.status(201).json({ success: true, message: 'Category created successfully', category });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating category', error });
    }
});

router.post('/:id/subcategories', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { subCategoryName } = req.body;

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const newSubCategory = new SubCategory({ name: subCategoryName });
        await newSubCategory.save();

        category.subCategories.push(newSubCategory._id);
        category.updatedAt = Date.now();

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Subcategory added successfully',
            category
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: 'Error adding subcategory',
            error
        });
    }
});


router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().populate('subCategories');
            const categoriesWithProductCount = await Promise.all(
                categories.map(async (category) => {
                    const productCount = await Product.countDocuments({ categoryId: category._id });
                    const subCategoriesWithProductCount = await Promise.all(
                        category.subCategories.map(async (subCategory) => {
                            const subCategoryProductCount = await Product.countDocuments({ subCategoryId: subCategory._id });
                            return {
                                ...subCategory.toObject(),
                                productCount: subCategoryProductCount
                            };
                        })
                    );
                    return {
                        ...category.toObject(),
                        productCount,
                        subCategories: subCategoriesWithProductCount
                    };
                })
            );

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            categories: categoriesWithProductCount
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: 'Error fetching categories',
            error
        });
    }
});


router.get('/subcategories', async (req, res) => {
    try {
        const subcategories = await SubCategory.find();

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            subcategories
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error fetching categories',
            error
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id).populate('subCategories');

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category fetched successfully', category });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error fetching category', error });
    }
});


router.get('/subcategory/:subcategoryId', async (req, res) => {
    const { subcategoryId } = req.params;

    try {
        const category = await SubCategory.findById(subcategoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }

        res.status(200).json({ success: true, message: 'Subcategory fetched successfully', category });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error fetching Subcategory', error });
    }
});


router.put('/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, subCategories } = req.body;

    try {
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category.name = name || category.name;
        category.subCategories = subCategories || category.subCategories;
        category.updatedAt = Date.now();

        await category.save();
        res.status(200).json({ success: true, message: 'Category updated successfully', category });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating category', error });
    }
});

router.delete('/:categoryId/subcategories/:subCategoryId', isAdmin, async (req, res) => {
    const { categoryId, subCategoryId } = req.params;

    try {
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category.subCategories = category.subCategories.filter(sub => sub._id.toString() !== subCategoryId);
        category.updatedAt = Date.now();
        await category.save();
        await SubCategory.findByIdAndDelete(subCategoryId);
        
        res.status(200).json({ success: true, message: 'Subcategory removed successfully', category });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error removing subcategory', error });
    }
});


router.delete('/:id', isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error deleting category', error });
    }
});

module.exports = router;
