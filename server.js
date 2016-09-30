const express = require("express"),
      app = express(),
      passport = require("passport"),
      LocalStrategy = require("passport-local").Strategy,
      bodyParser = require("body-parser"),
      session = require("express-session"),
      morgan = require("morgan"),
      router = require("./routes/tasks.js"),
      config = require("./config.js"),
      db = require("./db.js"),
      User = db.user,
      auth = require("./auth.js");

app.use(morgan("dev"));
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next) {
    if (!req.session.votes) {
	req.session.votes = [];
    }
    next();
});

app.use(express.static(__dirname + "/public"));
app.set("view engine", "pug");

app.use(router);

app.listen(config.port);
