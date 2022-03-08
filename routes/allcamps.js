const express = require('express');
const router = express.Router();
const fileupload = require('express-fileupload');
const path = require('path');
 //if we were storing it on some local storage
const expressError = require("../utils/error");
const wrapAsync = require("../utils/handle");
const ejsMate = require('ejs-mate');
const { campSchema, reviewSchema } = require("../schemas.js");
const { isAuthor} = require("../middleware.js");
//const { validateCampground} = require("../utils/validater");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const Campground = require('../models/campground');
const User = require('../models/user');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();
app.engine('ejs', ejsMate);
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,

    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,   //this means this session expires after 7 days of logging in
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(fileupload({
    useTempFiles:true
}));
app.use(express.static(path.join(__dirname, "Public")));
app.use(bodyParser.urlencoded({ extended: true })) //parses the form request
app.use(bodyParser.json())              //whenever a request is called app.use is called if it has consol.log(message)
app.use(methodOverride("_method"));     //the message in above comment will always be printed for all requests
app.use(express.static(path.join(__dirname, "Public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

cloudinary.config({ 
    cloud_name: 'college-of-engineering-pune', 
    api_key: '726234945147733', 
    api_secret: 'pQ4igcwM6EO-4ni_c2RoXUMJEA8' 
});

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

const upload = multer({ storage })

const validateCampground = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(',');      //we are iterating through the error object and concatinating them using a ","
        throw new expressError(400,errmsg);
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

router.get('/', wrapAsync(async (req, res) => {          
    const camps = await Campground.find({});
    res.render("pages/index", {camps});
    console.log("Display all camps");
}))
router.post('/',upload.array('image'),validateCampground,wrapAsync(async (req, res) => {          //post the new comment route 
    const file = req.files;
    const { title, location, image, price, description } = req.body;
    const add = new Campground({
        title: title,
        location:location,
        description: description,
        //image: 'https://source.unsplash.com/collection/483251',
        price: price,
        author: req.session.user_id
    }); 
    add.image = file.map(f => ({ url: f.path, filename: f.filename }));
    console.log(add);
    await add.save();
    req.flash('success', 'Successfully added a new camp!');
    res.redirect(`/allcamps/${add.id}`);
}))                            //the req.files will have the files that were uploaded their path etc
router.put('/edit/:id', isAuthor,validateCampground,wrapAsync(async (req, res) => {          //edit camp hence put request 
    const { id } = req.params;
    const { title,location,price,description} = req.body;
    const campground = await Campground.findByIdAndUpdate(id, { title: title, location: location, description: description, price: price });
    /*const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.image.push(...imgs);*/
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); //passing the filename of images to cloudinary to delete
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/allcamps/${id}`);
}))
router.get('/new', wrapAsync(async (req, res) => {          //route to create a new camp
    res.render("pages/new");
    console.log("Displays a form to create a new camping destination");
}))
router.delete('/delete/:id',isAuthor, wrapAsync(async (req, res) => {          //route to create a new camp
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    if (!camp) {
        throw new expressError(404, "sorryyyyyyyyyyyyyyyyyy camp not found!!");
    }
    else{
        console.log("Deletes the campground");
        res.redirect("/allcamps");
    }
}))
router.get('/:id', wrapAsync(async (req, res) => {       
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash("error", "Sorry camp not found!!!");
        res.redirect("/allcamps");
    }
    else {
        const user = await User.findById(req.session.user_id);
        console.log(camp.author.equals(user._id));
        req.flash("success", "camp successfully found!!!");
        res.render("pages/show", { camp,user});
    }
}))
router.get('/edit/:id',isAuthor, wrapAsync(async (req, res) => {       
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        throw new expressError(404, "sorry camp not found!!");
    }
    else {
        res.render("pages/edit",{camp});
        console.log("Edits a particular camp");
    }
}))

module.exports = router;