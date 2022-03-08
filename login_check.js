module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl   //we store the url the user was trying to visit so taht we can redirect him there
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}