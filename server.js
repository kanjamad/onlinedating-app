const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;



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

app.post('/contactUs', (req,res) => {
    console.log(req.body);
});


// ----------------------------- START SERVER ----------------------------- //

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
