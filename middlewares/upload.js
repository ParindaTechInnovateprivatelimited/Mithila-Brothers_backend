const cloudinary = require('../config/clodinary');

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const options = file.tempFilePath;
        cloudinary.uploader.upload(file.tempFilePath,{
            folder: 'uploads',
            use_filename: true
        }, (error, result) => {
            if (error) {
                // console.error('Cloudinary Upload Error:', error);
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        });
    });
};

module.exports = { uploadToCloudinary };
