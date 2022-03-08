const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/handle');
const { campSchema } = require("../schemas.js");
//const { isAuthor } = require('../middleware');
const { isLoggedIn } = require('../login_check');

const expressError = require('../utils/error');
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('pages/index_passport', { campgrounds })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('pages/new_passport');
})


router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { title,location,image,price,description} = req.body;
    const add = new Campground({
        title: title,
        location:location,
        description: description,
        image: 'https://source.unsplash.com/collection/483251',
        price: price,
        author: req.user._id
    }); 
    await add.save();
    req.flash('success', 'Successfully added a new camp!');
    res.redirect(`/campgrounds/${add.id}`);
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground.author);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('pages/show_passport', { campground });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    if (!campground.author.equals(currentUser._id)) {
        res.flash('error', 'Not permitted to update the campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    }
    res.render('pages/edit_passport', { campground });
}))

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, location, image, price, description } = req.body;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(currentUser._id)) {
        res.flash('error', 'Not permitted to update the campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    }
    const camp = await Campground.findByIdAndUpdate(id, { title: title,location:location,image:image,price:price,description:description});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));

module.exports = router;