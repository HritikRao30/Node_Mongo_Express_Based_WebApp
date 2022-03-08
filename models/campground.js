const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: [{
        url:String,
        filename:String
    }],
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref:"User"
    }
});

CampgroundSchema.post('findOneAndDelete', async function (camp){  //this is a post middle ware whil will run after 
    if (camp){                                                    //find one and delete runs and we get the camp and
        await Review.deleteMany({_id: {$in: camp.reviews}})
    } //we delete the ids that were present in the camp.reviews array
})

module.exports = mongoose.model('Campground', CampgroundSchema);