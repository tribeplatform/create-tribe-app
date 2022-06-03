// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '@config';

import passport from 'passport';
import express from 'express';

const init = (app: express.Application) => {
//   passport.use(
//     new LocalStrategy(
//       {
//         clientID: GOOGLE_CLIENT_ID,
//         clientSecret: GOOGLE_CLIENT_SECRET,
//         callbackURL: 'https://www.example.com/oauth2/redirect/google'
//       },
//       async (..., done) => {
//         done(null, {})
//       },
//     ),
//   );
  app.use(passport.initialize());
};

export default {
  init,
};