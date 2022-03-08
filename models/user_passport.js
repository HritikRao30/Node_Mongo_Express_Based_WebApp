const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true          //the passport ensures that all emails stored are unique
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User_passport', UserSchema);