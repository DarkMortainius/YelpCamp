const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviewController');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Add a review
router.post('/', isLoggedIn, validateReview, reviews.createReview);

// Delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviews.deleteReview);

module.exports = router;