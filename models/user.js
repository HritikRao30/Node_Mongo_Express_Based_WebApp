const mongoose = require('mongoose');
//const Review = require('./review')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');  //its one of the hashing functions for passwords

const userSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true }
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

userSchema.statics.findAndValidate = async function (username, password) {
    const foundUser = await this.findOne({ username });
    const isValid = await bcrypt.compare(password, foundUser.password);
    if (isValid) {
        return foundUser;
    }
    else {
        return false;
    }
}
module.exports = mongoose.model('User', userSchema);