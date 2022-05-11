const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./reviewModel');
const { cloudinary } = require('../cloudinary/cloudinaryConfig')

const options = { toJSON: { virtuals: true } };
const ImageSchema = new Schema({
    url: String,
    filename: String
}, options
);
ImageSchema.virtual('thumbnail').get(function ()
{
    return this.url.replace('/upload', '/upload/h_300,w_400,c_fill');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, options
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function ()
{
    const thumbnail = "https://res.cloudinary.com/dhciyldzx/image/upload/v1651605296/YelpCamp/No_image_available_uvjjil.png";
    if (this.images.length !== 0)
    {
        thumbnail = this.images[0].thumbnail;
    }
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
            <p>${this.location}</p>            
            <p><img src="${thumbnail}" width="200px" height="auto"</p>
            <p>${this.description.substring(0, 35)}...`;
});

// When deleting a campground, go through and delete all assoiciated reviews as well
CampgroundSchema.post('findOneAndDelete', async (campground) =>
{
    if (campground.reviews)
    {
        await Review.deleteMany({ _id: { $in: campground.reviews } });
    }

    if (campground.images)
    {
        for (let image of campground.images)
        {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);