const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/userController');

router.route('/register')
    .get(users.renderRegisterForm) // Render the register user page
    .post(users.register); // Register a new user

router.route('/login')
    .get(users.renderLoginForm) // Render the login page
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login); // Login a user

// Logout a user
router.get('/logout', users.logout);

module.exports = router;