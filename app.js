if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();              //this dotenv looks for a file named .env and stores 
}            //all the key present there as process.env variables (environmental variables)

const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const localDb = "mongodb://localhost:27017/yelp-camp";
const dbUrl = 'mongodb+srv://hr:hritikrao@cluster0.0isic.mongodb.net/yelpcamp?retryWrites=true&w=majority';
const session = require('express-session');
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
    url: localDb,
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const flash = require('connect-flash');
const expressError = require("./utils/error");
const ejsMate = require('ejs-mate');
const { campSchema,reviewSchema } = require("./schemas.js");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const Review = require('./models/review');
const Campground = require('./models/campground');
const User = require('./models/user');
const app = express();
const route1 = require('./routes/allcamps');
const route2 = require('./routes/campgrounds');
const admin = require('./routes/admin');
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "Public")));
app.use(bodyParser.urlencoded({ extended: true })) //parses the form request
app.use(bodyParser.json())              //whenever a request is called app.use is called if it has consol.log(message)
app.use(methodOverride("_method"));     //the message in above comment will always be printed for all requests
app.use(express.static(path.join(__dirname, "Public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
//mongodb + srv://HR:<password>@cluster0.uwm8v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
mongoose.connect(dbUrl, { //creates a database called yelp-camp
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
const sessionConfig = {
    store,
    name:'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,   //this means this session expires after 7 days of logging in
        maxAge: 1000 * 60 * 60 * 24 * 7     //this cookie sent by teh session expires automatically after 1 week
    }
}
app.use(session(sessionConfig))
app.use(flash());
/*const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("Database connected!!")
});*/
const validateCampground = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(',');      //we are iterating through the error object and concatinating them using a ","
        throw new expressError(400,errmsg);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    console.log(error);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(400, msg);
    } else {
        next();
    }
}
app.use((req, res, next) => {
    res.locals.messages = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.alerts = "Anonymous";
    if (req.session.username) {
        res.locals.alerts = req.session.username;
    }
    if (req.session.user_id) {
        res.locals.user_id = req.session.user_id;
    }
    next();
})
//these are the routes are for the reviews
app.use('/campgrounds', route2);
//these are routes for the campgrounds
app.use('/starter', admin);
app.use('/allcamps', route1);
app.all("*",(req, res) => {                 //"*" represents all  the get requests any path will do but the ordering matters as it is placed at the end
    console.log("404 Sorry page not found!!");
    throw new expressError(404, "Not found!!");
})
app.use((err,req, res, next)=>{              //error handler
    if (!err.status) {
        err.status = 404;
    }
    if (!err.name) {
        err.name = "ERROR!!";
    }
    res.status(err.status).render("pages/error", {err});       //we can send both err.stack or err.message as stack trace is extremely usefull.
                                            //next(err) makes sense ionly when the current error handler hasnt closed tghe req res cycle
})
//const port = process.env.PORT || 3000;
app.listen(80,() => {
    console.log(`port 80 is listening`);
})