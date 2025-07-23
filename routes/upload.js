const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/admin');
const { uploadToCloudinary } = require('../middlewares/upload');

router.post('/upload', isAdmin, async (req, res) => {
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
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Image upload failed',
            error: error.message
        });
    }
});

module.exports = router;
