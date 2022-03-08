const mongoose = require("mongoose");
const Campground = require('../models/campground');
const cities = require("./cities");
const { descriptors, places } = require("./helpers");
mongoose.connect('mongodb://localhost:27017/yelp-camp', { //creates a database called yelp-camp in mongo db
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Mongo db connection Success!!");
})
.catch((err) => {
    console.log("Mongo refused to connect!!!");
    console.log(err);
})
const putvalues = array => array[Math.floor(Math.random() * array.length)];

const dbset = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++){
        const indexcity = Math.floor(Math.random() * 1000);
        const c = new Campground({
            author:'62242c779fe334590083cbcf',
            title: `${putvalues(places)}`,
            location: `${cities[indexcity].city},${cities[indexcity].state}`,
            description: `${putvalues(descriptors)}`,
            image: [{url:"https://source.unsplash.com/collection/483251",filename:"camp"}],
            price: Math.floor(Math.random() * 100)
        });
        await c.save();
    }
}
dbset() //async function return a promise so after success .then =. we close the mongoose mongo db connection
    .then(()=>{
        console.log("yes successfully seeded the database");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.log("failed!!")
        console.log(err);
        //mongoose.connection.close();
})
