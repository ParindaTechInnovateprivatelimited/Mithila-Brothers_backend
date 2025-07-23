const express = require('express');
const { addReview, getProductReviews, uploadPhoto } = require('../controllers/reviewController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/:productId/reviews', auth, addReview);

router.get('/:productId/reviews', getProductReviews);
router.post('/upload', auth, uploadPhoto);

module.exports = router;

