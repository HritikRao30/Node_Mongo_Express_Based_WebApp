const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const expressError = require("./utils/error");
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user_passport');


const userRoutes = require('./routes/admin_passport');
const campgroundRoutes = require('./routes/campgrounds_passport');
const reviewRoutes = require('./routes/reviews_passport');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

.then(() => {
    console.log("Mongo db connection Success!!");
})
.catch((err) => {
    console.log("Mongo refused to connect!!!");
    console.log(err);
})

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //console.log(req.session)
    res.locals.currentUser = req.user;         //the user info username email and password(hashed form)-with passport
    res.locals.messages = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new expressError( 404,'Page Not Found'))
})

app.use((err,req, res, next)=>{             
    if (!err.status) {
        err.status = 404;
    }
    if (!err.name) {
        err.name = "ERROR!!";
    }
    res.status(err.status).render("pages/error", {err});      
                                            
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})