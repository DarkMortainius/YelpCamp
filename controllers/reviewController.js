const Campground = require('../models/campgroundModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

// Add a review to a specific campground
module.exports.createReview = catchAsync(async (req, res, next) =>
{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
});

// Delete a review from a campground
module.exports.deleteReview = catchAsync(async (req, res, next) =>
{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
});