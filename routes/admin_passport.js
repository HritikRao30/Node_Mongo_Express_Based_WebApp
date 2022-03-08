const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/handle');
const User = require('../models/user_passport');

router.get('/register', (req, res) => {
    res.render('register_passport');
});

router.post('/register', wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);            //even after registering the session or req.user remains empty
            req.flash('success', 'Welcome to Yelp Camp!');  //hence this function is used
            const redirectUrl = req.session.returnTo || '/campgrounds';   //if nothing then by default redirect to campgrounds
            delete req.session.returnTo;  //delete the session.returnto
            res.redirect(redirectUrl);
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('login_passport');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    //console.log(req.user);
    const redirectUrl = req.session.returnTo || '/campgrounds';   //if nothing then by default redirect to campgrounds
    delete req.session.returnTo;  //delete the session.returnto
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
})

module.exports = router;