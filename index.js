const express = require("express");
const connectToMongo = require("./db");
var cors = require('cors')
const path = require('path');
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const cookieParser = require('cookie-parser');
const { sanitizeUser, cookiesExtracter, isAuth } = require("./middlewere/userAuth");
const jwt = require('jsonwebtoken');
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local");
connectToMongo();
const app = express();
const port = process.env.PORT || 8080;
// const port = process.env.PORT || 5000;
const User = require("./models/User");

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'build')))
app.use(express.static("public"));
app.use(cookieParser());


app.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);

app.use(
  session({
    secret:process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
  })
);
app.use(passport.initialize());
// set session for only 1 hour :todo
app.use(passport.session());
app.use(passport.authenticate("session"));
passport.use(
  "local",
  new LocalStrategy({usernameField: "email"}, async function (email, password, done) {
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { msg: "User does Not exit" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { msg: "password is wrong" });
      }
      jwt.sign(sanitizeUser(user),process.env.JWT_SECRET_KEY,{ expiresIn: "1h" },(err, token) => {
          if (err) throw err;
          return done(null, token );
        }
      );
    } catch (err) {
      console.error(err.message);
      done(err);
    }
  })
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, sanitizeUser(user));
  });
});
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

let opts = {};
opts.jwtFromRequest = cookiesExtracter;
opts.secretOrKey = process.env.JWT_SECRET_KEY;

passport.use(
  "jwt",
  new JwtStrategy(opts,async function (jwt_payload, done) {
    try {
      const user = await User.findById({ _id: jwt_payload.id });
      if (user) {
        return done(null,sanitizeUser(user));
      }else{
        return done(null, false, { msg: "User does Not exit" });
      }
    } catch (err) {
      console.error(err.message);
      done(err);
    }
  })
);

// available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", isAuth(), require("./routes/notes"));

app.get('/', (req, res) =>
  res.json({"success": true})
);
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});
app.get('*', (req, res) =>
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
