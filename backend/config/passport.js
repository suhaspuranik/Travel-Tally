// config/passport.js
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleOAuthCallback, serializeUser, deserializeUser } from '../controllers/userController.js';

export default function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, googleOAuthCallback));

    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
};
