const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const Campground = require('../models/campgroundModel');
const catchAsync = require('../utils/catchAsync');
const { cloudinary } = require('../cloudinary/cloudinaryConfig');

// Find and display all campgrounds
module.exports.renderIndexPage = catchAsync(async (req, res, next) =>
{
    const campgrounds = await Campground.find({}).sort('-_id');
    res.render('campgrounds/index', { campgrounds });
});

// Show the create campground page
module.exports.renderNewForm = (req, res) =>
{
    res.render('campgrounds/newCampground');
};

// Add a new campground to the database
module.exports.createCampground = catchAsync(async (req, res, next) =>
{
    const campground = new Campground(req.body.campground);
    const geoData = await geocoder.forwardGeocode({
        query: campground.location,
        limit: 1
    }).send();
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
});

// Display a single campground page
module.exports.renderCampgroundPage = catchAsync(async (req, res, next) =>
{
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (!campground)
    {
        req.flash('error', 'Unable to find campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/showCampground', { campground });
});

// Display edit campground page
module.exports.renderEditForm = catchAsync(async (req, res, next) =>
{
    const campground = await Campground.findById(req.params.id);
    if (!campground)
    {
        req.flash('error', 'Unable to find campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/editCampground', { campground });
});

// Edit an existing campground
module.exports.updateCampground = catchAsync(async (req, res, next) =>
{
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    const images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages)
    {
        for (let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
});

// Delete a campground
module.exports.deleteCampground = catchAsync(async (req, res, next) =>
{
    const campground = await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
});