const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Load models
const Message = require('./models/message');
const User = require('./models/user');
// load keys file
const Keys = require('./config/keys');
// Load Helpers
const {requireLogin,ensureGuest} = require('./helpers/auth');



// ----------------------------- MIDDLEWARE ----------------------------- //

//  Express Session Config
app.use(cookieParser());
app.use(session({
secret: process.env.SESSION_SECRET || 'mysecret',
resave: true,
saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
// Make user global object
app.use((req,res, next) => {
    res.locals.user = req.user || null;
    next();
});
// load passport
require('./passport/facebook');
require('./passport/google');

// BodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/onlinedatingapp1';

mongoose.connect(DB_URL, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: false })
    .then(() => console.log('MongoDB connected...'))
    .catch((err) => console.log(err));



// ----------------------------- setup view engine --------------------------//
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// ----------------------------- HTML ENDPOINT ----------------------------- //

// GET Root Route
app.get('/',ensureGuest,(req,res) => {
    res.render('home', {
        title: 'Home'
    });
});

// ----------------------------- API ENDPOINT ----------------------------- //


app.get('/about',ensureGuest,(req,res) => {
    res.render('about', {
        title: 'About'
    });
});

app.get('/contact',ensureGuest,(req,res) => {
    res.render('contact', {
        title: 'Contact'
    });
});

app.get('/profile',requireLogin,(req,res) => {
    User.findById({_id:req.user._id}).then((user) => {
        if (user) {
            user.online = true;
            user.save((err,user) => {
                if (err) {
                    throw err;
                }else{
                    res.render('profile', {
                        title: 'Profile',
                        user: user
                    });
                }
            })
        }
    });
});


app.post('/contactUs',(req,res) => {
    console.log(req.body);
    const newMessage = {
        fullname: req.body.fullname,
        email: req.body.email,
        message: req.body.message,
        date: new Date()
    }
    new Message(newMessage).save((err,message) => {
        if (err) {
            throw err;
        }else{
            Message.find({}).then((messages) => {
                if (messages) {
                    res.render('newmessage', {
                        title: 'Sent',
                        messages:messages
                    });
                }else{
                    res.render('noMessage',{
                        title: 'Not Found'
                    });
                }
            });
        }
    });
});


// ---------------------------- Auth ----------------------------------- //
// facebook
app.get('/auth/facebook',passport.authenticate('facebook',{
    scope: ['email']
}));
app.get('/auth/facebook/callback',passport.authenticate('facebook',{
    successRedirect: '/profile',
    failureRedirect: '/'
}));

// google
app.get('/auth/google',passport.authenticate('google',{
    scope: ['profile']
}));
app.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect: '/profile',
    failureRedirect: '/'
}));

app.get('/logout',(req,res) => {
    User.findById({_id:req.user._id})
    .then((user) => {
        user.online = false;
        user.save((err,user) => {
            if (err) {
                throw err;
            }
            if (user) {
                req.logout();
                res.redirect('/');
            }
        })
    })
});

// ----------------------------- START SERVER ----------------------------- //

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
