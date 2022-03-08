const express = require('express');
const bcrypt = require('bcrypt');       //This is a password hashing algorithm
const router = express.Router();
const path = require('path');
const wrapAsync = require("../utils/handle");
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const User = require('../models/user');
//const { userSchema } = require("../schemas.js");
const app = express();
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "Public")));
app.use(bodyParser.urlencoded({ extended: true })) //parses the form request
app.use(bodyParser.json())              //whenever a request is called app.use is called if it has consol.log(message)
app.use(methodOverride("_method"));     //the message in above comment will always be printed for all requests
app.use(express.static(path.join(__dirname, "Public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

router.post('/register', wrapAsync(async (req, res) => {          //post the new comment route 
    const { name, password } = req.body;
    const user = new User({ name, password })
    const userlatest = await user.save();
    req.session.user_id = user._id;
    req.session.username = user.name;
    console.log(userlatest);
    req.flash("success", "Welcome to yelpcamp!!");
    res.redirect("/allcamps");
}))
router.post('/logout', (req, res) => {          //post the new comment route 
    if (req.session.user_id) {
        req.session.user_id = null;
        req.session.username = null;
    }
    req.flash("success", "Successfully logged out!!");
    res.redirect("/starter");
})
router.get('/', (req, res) => {
    res.render("home");
})

router.post('/login', wrapAsync(async (req, res) => {          //post the new comment route 
    const { name, password } = req.body;
    const foundUser = await User.findOne({ name });
    const result = await bcrypt.compare(password, foundUser.password);
    if (result){
        req.session.user_id = foundUser._id;
        req.session.username = foundUser.name;
        req.flash("success", "Successfully logged in!!");
        res.redirect("/allcamps");
    }
    else {
        req.flash("error", "Invalid username/password");
        res.redirect("/starter/login");
    }
}))
router.get('/secret', (req, res) => {          //post the new comment route 
    if (req.session.user_id) {
        res.render("secret");
    }
    else {
        req.flash("error", "please login or signup to see the secret message!!");
        res.redirect("/starter/register");
    }
})
router.get('/register', (req, res) => {   
    res.render("register");
})
router.get('/login', (req, res) => {   
    res.render("login");
})

module.exports = router;