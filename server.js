const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Load models
const Message = require('./models/message');



// ----------------------------- MIDDLEWARE ----------------------------- //

//  Express Session Config
app.use(session({
secret: process.env.SESSION_SECRET || 'Elephant poker championships',
resave: false,
saveUninitialized: false,
}));

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
app.get('/', (req,res)=> {
    res.render('home', {
        title: 'Home'
    });
});

// ----------------------------- API ENDPOINT ----------------------------- //


app.get('/about', (req,res) => {
    res.render('about', {
        title: 'About'
    });
});

app.get('/contact', (req,res) => {
    res.render('contact', {
        title: 'Contact'
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


// ----------------------------- START SERVER ----------------------------- //

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
