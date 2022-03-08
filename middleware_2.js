const User = require('./models/user');
const Review = require('./models/review');

module.exports.isreviewAuthor = async (req, res, next) => {
    const { id,revid } = req.params;
    const review = await Review.findById(revid);
    const user = await User.findById(req.session.user_id);
    console.log(user);
    console.log(review);
    if (!review.author.equals(user._id)){
        req.flash('error', 'You are not authorised!');
        return res.redirect(`/allcamps/${id}`);
    }
    next();
}