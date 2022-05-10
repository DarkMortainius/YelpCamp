if (process.env.NODE_ENV !== 'production')
{
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');


const User = require('./models/userModel');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// Connect to mongoDB
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>
{
    console.log('Database connected');
});

// Initialize express
const app = express();

// Set view engine to ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Tell express to use urlencoded data
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Set up static resources
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

// Configure the session
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
});

store.on('error', function (err)
{
    console.log('Session Store error!', e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

// Set up helmet Content Security Policy
const scriptSrcUrls = [
    'https://api.mapbox.com/',
    'https://cdn.jsdelivr.net/'
];

const styleSrcUrls = [
    'https://cdn.jsdelivr.net/',
    'https://api.mapbox.com/'
];

const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://events.mapbox.com/'
];

const fontSrcUrls = [];
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dhciyldzx/"
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
            }
        },
        crossOriginEmbedderPolicy: false
    })
);

// Initialize Passport authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Sanitize any input
app.use(mongoSanitize());

// Set up moment to allow timestamps on template pages
app.locals.moment = require('moment');

// Set up middle-ware to handle flash messages for all routes
app.use((req, res, next) =>
{
    if (!['/login', '/'].includes(req.originalUrl))
    {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    return next();
});

// Attach routes to app
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// Display home page
app.get('/', (req, res) =>
{
    res.render('home');
});

// Catch any remaining requests
app.all('*', (req, res, next) =>
{
    return next(new ExpressError(404, 'Page Not Found'));
});

// Error handler
app.use((err, req, res, next) =>
{
    const { status = 500 } = err;
    if (!err.message)
    {
        err.message = 'Something went horribly wrong!';
    }
    res.status(status).render('error', { err });
});

// Start listening for traffic
const port = process.env.PORT || 3000
app.listen(port, () =>
{
    console.log(`Serving on port ${port}`);
});