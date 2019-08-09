const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const keys = require('../config/keys');

passport.serializeUser((user,done) => {
    done(null,user.id);
});

passport.deserializeUser((id,done) => {
    User.findById(id,(err,user) => {
        done(err,user);
    });
});

passport.use(new FacebookStrategy({
    clientID: keys.FacebookAppID,
    clientSecret:keys.FacebookAppSecret,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['email','name','displayName','photos']
},(accessToken, refreshToken, profile,done) => {
    console.log(profile);
}));