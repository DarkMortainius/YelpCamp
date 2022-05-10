const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary/cloudinaryConfig');
const upload = multer({ storage });
const campgrounds = require('../controllers/campgroundController');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/')
    .get(campgrounds.renderIndexPage) // Render index page
    .post(isLoggedIn, upload.array('image'), validateCampground, campgrounds.createCampground); // Create a new campground

// Render new campground form
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.renderCampgroundPage) // Render campground page
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, campgrounds.updateCampground) // Update existing campground
    .delete(isLoggedIn, isAuthor, campgrounds.deleteCampground); // Delete a campground

// Render edit campground page
router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm);

module.exports = router;