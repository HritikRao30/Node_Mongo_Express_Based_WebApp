const { campSchema,reviewSchema } = require("../schemas.js");


const validateCampground = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(',');      //we are iterating through the error object and concatinating them using a ","
        throw new expressError(400,errmsg);
    } else {
        next();
    }
}

module.exports = validateCampground;

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
module.exports = validateReview;

const validateLogin = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    console.log(error);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(400, msg);
    } else {
        next();
    }
}
module.exports = validateLogin;

