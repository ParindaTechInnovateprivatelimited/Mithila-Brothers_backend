const cloudinary = require('../config/clodinary');
const streamifier = require('streamifier');

/**
 * Upload an in-memory buffer (file.data) to Cloudinary.
 * @param {object} file - The file object from express-fileupload (in-memory).
 * @returns {Promise<string>} - The secure URL of the uploaded file.
 */
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'uploads',
                use_filename: true,
                resource_type: 'auto', // supports image, video, etc.
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        // Convert buffer to stream and pipe to Cloudinary
        streamifier.createReadStream(file.data).pipe(uploadStream);
    });
};

module.exports = { uploadToCloudinary };
