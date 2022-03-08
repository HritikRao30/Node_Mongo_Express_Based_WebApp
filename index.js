const { response } = require('express');
const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(morgan('tiny'));
app.use((req, res, next) => {
    //req.method = "POST";
    console.log(req.method, req.path);   //this is a middleware that works between req and response and this returns the req method and req path
    next();
})                                          //req.method is get post etc
app.use((req, res, next) => {             //req.path id the url that is requested it does not include query string
    req.requestTime = Date.now();           //This middleware is providing the req a time as earlier it did not have any time
    console.log(req.method, req.path);      //Date.now() function is used especially for this purpose
    next();
})

app.use('/dogs', (req, res, next) => {
    console.log("I LOVE DOGS!!")
    next();
})

const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'helloworld') {
        next();    //to execute the later middlewares or the consecutive call backs and subsequent rendering will happen 
    }
    res.send("YOU NEED A PASSWORD!")   //once res.send or res.render has occured it is end of the road for the that request-respond cycle
}
//the above execution of the middlewares will be first middleware then second then third then the date from any get if matches
//and then after next console.log() in the first middle ware and finally the message from morgan
app.use((req, res, next) => {
    console.log("THIS IS MY FIRST MIDDLEWARE!!!")
    next();
    console.log("THIS IS MY FIRST MIDDLEWARE - AFTER CALLING NEXT()")
 })
 app.use((req, res, next) => {
    console.log("THIS IS MY SECOND MIDDLEWARE!!!")
    next();
 })
 app.use((req, res, next) => {
    console.log("THIS IS MY THIRD MIDDLEWARE!!!")
    next();                //this next is a inbuilt function that instructs the middleware to jump to the next middleware
 })                        //in express the app.use is used to define self defined middleware and aswell as app.get app.post is also a middleware 
                        

app.get('/', (req, res) => {
    console.log(`REQUEST DATE: ${req.requestTime}`)
    res.send('HOME PAGE!')
})

app.get('/dogs', (req, res) => {
    console.log(`REQUEST DATE: ${req.requestTime}`)
    res.send('WOOF WOOF!')
})

app.get('/secret', verifyPassword, (req, res) => {   //here this verify password function acts as a midddleware and implements logic between req and response
    res.send('MY SECRET IS: Sometimes I wear headphones in public so I dont have to talk to anyone')
})

app.use((req, res) => {                   //this is used at the end as this middle ware is run after app.get and app.post finishes
    res.status(404).send('NOT FOUND!')    //this is done to first test out all the combinations if url and method does not match any
})                                         //then respond with status 404 not found


app.listen(3000, () => {
    console.log('App is running on localhost:3000')
})