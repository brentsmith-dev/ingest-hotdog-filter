const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");

const nconf = require('nconf');
nconf.argv().env();

const APP_KEY = nconf.get('APP_KEY');
const APP_SECRET = nconf.get('APP_SECRET');

const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const IngestSDK = require("@ingest/ingest-node-sdk");
const Ingest = require('./services/Ingest');

const index = require("./routes/index");
const ai = require('./routes/ai');
const vet = require('./routes/vet');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://login.ingest.io/authorize",
      tokenURL: "https://login.ingest.io/token",
      clientID: "fake",
      clientSecret: "alsofake",
      response_type: "code",
      scope: "all",
      callbackURL: "/auth/ingest/callback"
    },
    function(access, refresh, profile, cb) {
      app.ingest = new IngestSDK({
        token: `Bearer ${access}`
      });

      app.ingest.Users.getCurrentUserInfo((err, { data }) => {
        const { id, name, email } = data;
        app.user = {
          access,
          refresh,
          id,
          name,
          email
        };

        return cb(null, app.user);
      });
    }
  )
);

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
/*app.use(
  session({
    secret: require("./conf.js").SESSION_SECRET || "dj kitty"
  })
);*/
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
  res.render("login", { title: "Please Login" });
});

app.get("/auth/ingest", passport.authenticate("oauth2"));

app.get(
  "/auth/ingest/callback",
  passport.authenticate("oauth2", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout();

  return res.redirect("/login");
});

app.use('/vet', vet);

app.use("/", checkAuth, index);

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect("/login");
  }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
