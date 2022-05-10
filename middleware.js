const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campgroundModel');
const Review = require('./models/reviewModel');

// Checks that a user is logged in before proceeding, otherwise
// goes back to login page.
module.exports.isLoggedIn = (req, res, next) =>
{
    if (!req.isAuthenticated())
    {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

// Checks that the user the author of the campground, otherwise they
// are redirected back to the campground details page (or the main
// campground index if the campground isn't a valid id)
module.exports.isAuthor = catchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        req.flash('error', 'Unable to find campground!');
        return res.redirect('/campgrounds');
    }
    else if (!campground.author.equals(req.user._id))
    {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
});

// Checks that the user the author of the review, otherwise they
// are redirected back to the campground details page (or the main
// campground index if the review isn't a valid id)
module.exports.isReviewAuthor = catchAsync(async (req, res, next) =>
{
    const { reviewId, id } = req.params;
    const review = await Review.findById(reviewId);
    if (!review)
    {
        req.flash('error', 'Unable to find review!');
        return res.redirect(`/campgrounds/${id}`);
    }
    else if (!review.author.equals(req.user._id))
    {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
});

// Validates the data for a new campground
module.exports.validateCampground = (req, res, next) =>
{
    const { error } = campgroundSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(400, msg);
    }
    else
    {
        return next();
    }
};

// Validates the data for a new review
module.exports.validateReview = (req, res, next) =>
{
    const { error } = reviewSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(400, msg);
    }
    else
    {
        return next();
    }
};
