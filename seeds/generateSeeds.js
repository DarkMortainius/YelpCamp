if (process.env.NODE_ENV !== 'production')
{
    require('dotenv').config();
}
const mongoose = require('mongoose');
const Campground = require('../models/campgroundModel');
const cities = require('./cities');
const { places, descriptors, images } = require('./seedHelpers');

mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>
{
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () =>
{
    await Campground.deleteMany({});
    for (let i = 0; i < 13 * 20; i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images:
                [
                    images[i % 13],
                    images[i % 13 + 1]
                ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi iusto reprehenderit rem corrupti. Voluptatum voluptate doloribus eveniet pariatur aliquid, quibusdam, quae rerum, facere iste dicta id. Nostrum delectus voluptatum fuga.',
            price,
            author: '627ae11ef5be1c20adb07e0e',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            createdAt: Date.now()
        });
        await camp.save();
    }
}

seedDB().then(() =>
{
    mongoose.connection.close();
});