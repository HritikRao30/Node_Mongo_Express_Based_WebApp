const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
app.use(cookieParser('thisismysecret'));        //this is for using a signed cookie it verifies whether the cookie has been tampered or not?
const sessions = { secret: 'somesecretkey', resave: false,saveUninitialized:false};
app.use(session(sessions));

app.use((req, res, next) => {
    res.locals.messages = req.flash('success');
    next();
})
app.get('/viewcount', (req, res) => {
    if (req.session.count) {
        req.session.count += 1; 
    }
    else {
        req.session.count = 1;
    }
    res.send(`this is your ${req.session.count} visit`);  
})
app.get('/greet2', (req, res) => {
    const { name1 = 'Anonymous' } = req.cookies;
    res.send(`Hey there, ${name1}`)
})

app.get('/setname', (req, res) => {
    res.cookie('name1', 'henrietta');         //cookies are essentially key value pairs
    res.cookie('animal1', 'harlequin shrimp')  //and for name value given is henrietta
    res.send('OK SENT YOU A COOKIE!!!')
})

app.get('/setname2', (req, res) => {
    res.cookie('name2', 'Hritik');         //cookies are essentially key value pairs
    res.cookie('age', 21);         //cookies are essentially key value pairs
    res.cookie('animal2', 'harlequin shrimp')  //and for name value given is Hritik
    res.send('OK SENT YOU A COOKIE!!!')
})

app.get('/getsignedcookie', (req, res) => {
    res.cookie('fruit', 'grape', { signed: true })
    res.send('OK SIGNED YOUR FRUIT COOKIE!')
})

app.get('/getsignedcookie2', (req, res) => {
    res.cookie('result', 'great', { signed: true })
    res.send('OK SIGNED YOUR FRUIT COOKIE!')
})

app.get('/verifyfruit', (req, res) => {
    console.log(req.cookies)        //prints the other cookies
    console.log(req.signedCookies) //prints signed cookies
    res.send(req.signedCookies)
})

app.get('/show', (req, res) => {
    res.send(req.cookies)
})
app.get('/tamper', (req, res) => {
    res.cookie('fruit', 'grapessss', { signed: true });
})

app.listen(3000, () => {
    console.log("SERVING!")
})