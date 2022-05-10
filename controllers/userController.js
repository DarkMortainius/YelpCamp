const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

// Render the register user page
module.exports.renderRegisterForm = (req, res) =>
{
    res.render('users/registerUser');
};

// Register a new user
module.exports.register = catchAsync(async (req, res, next) =>
{
    try
    {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err =>
        {
            if (err)
            {
                return next(err);
            }
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        });
    }
    catch (err)
    {
        req.flash('error', err.message);
        res.redirect('/register');
    }
});

// Render the login page
module.exports.renderLoginForm = (req, res) =>
{
    res.render('users/login');
};

// Login a user
module.exports.login = (req, res) =>
{
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Logout a user
module.exports.logout = (req, res) =>
{
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/campgrounds');
};