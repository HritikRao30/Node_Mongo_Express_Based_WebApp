const express = require('express');
const router = express.Router();
const path = require('path');
const wrapAsync = require("../utils/handle");
const ejsMate = require('ejs-mate');
const { campSchema,reviewSchema } = require("../schemas.js");
//const {validateReview } = require("../utils/validater");
const { isreviewAuthor} = require("../middleware_2.js");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');
const app = express();
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "Public")));
app.use(bodyParser.urlencoded({ extended: true })) //parses the form request
app.use(bodyParser.json())              //whenever a request is called app.use is called if it has consol.log(message)
app.use(methodOverride("_method"));     //the message in above comment will always be printed for all requests
app.use(express.static(path.join(__dirname, "Public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

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

router.use((req, res, next) => {        //router.use uses this extra middleware only for these set of routes
    if (req.session.user_id) {
        return next();
    }
    req.flash("error", "please login/sign-up first");
    res.redirect("/starter")
})

router.post('/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    const user = await User.findById(req.session.user_id);
    review.author = user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "comment successfully added!!");
    res.redirect(`/allcamps/${campground._id}`);
}))

router.delete('/:id/reviews/:revid',isreviewAuthor,wrapAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.revid } });
    await Review.findByIdAndDelete(req.params.revid);
    req.flash("success", "comment successfully deleted!!");
    res.redirect(`/allcamps/${req.params.id}`);
}))

module.exports = router;