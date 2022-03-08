const Campground = require('./models/campground');
const User = require('./models/user');

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const user = await User.findById(req.session.user_id);
    console.log(user);
    console.log(campground);
    if (!campground.author.equals(user._id)){
        req.flash('error', 'You are not authorised!');
        return res.redirect('/allcamps');
    }
    next();
}

