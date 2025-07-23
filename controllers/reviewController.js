const Review = require('../Models/Review');
const Product = require('../Models/Product');
const { uploadToCloudinary } = require('../middlewares/upload');



exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId).populate('reviews');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.status(200).json({ Success: true, reviews: product.reviews });
    } catch (error) {
        return res.status(500).json({ Success: false, error: 'Server error', details: error.message });
    }
};



exports.addReview = async (req, res) => {
    const userId = req.user.id;
    try {
        const { productId } = req.params;

        const product = await Product.findOne({ _id: productId });

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const existingReview = await Review.findOne({ productId: productId, userId: userId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }

        const { name, message, rating } = req.body;

        const images = req.files?.files;
        let uploadedImages = [];

        if (images) {
            const imageArray = Array.isArray(images) ? images : [images];

            for (let i = 0; i < imageArray.length; i++) {
                const imageUrl = await uploadToCloudinary(imageArray[i]);
                uploadedImages.push({
                    url: imageUrl,
                    order: i + 1
                });
            }
        }

        const newReview = new Review({
            name,
            message,
            rating,
            images: uploadedImages,
            userId: userId,
            productId: productId
        });

        await newReview.save();

        product.reviews.push(newReview._id);

        const totalRating = (product.rating * product.reviewCount) + rating;
        product.reviewCount += 1;
        product.rating = totalRating / product.reviewCount;

        await product.save();

        return res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Server error', details: error.message });
    }
};

exports.uploadPhoto = async (req, res) => {
    const images = req.files.files;
    if (!images) {
        return res.status(400).json({ message: 'No image files uploaded' });
    }

    const imageArray = Array.isArray(images) ? images : [images];

    try {
        const uploadedImages = [];

        for (let i = 0; i < imageArray.length; i++) {
            const imageUrl = await uploadToCloudinary(imageArray[i]);
            uploadedImages.push({
                url: imageUrl,
                order: i + 1
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            images: uploadedImages
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Image upload failed',
            error: error.message
        });
    }
};
