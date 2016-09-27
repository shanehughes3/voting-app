const express = require("express"),
      app = express(),
      passport = require("passport"),
      LocalStrategy = require("passport-local").Strategy,
      bodyParser = require("body-parser"),
      session = require("express-session"),
      morgan = require("morgan"),
      routes = require("./routes/tasks.js"),
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

app.use(express.static(__dirname + "/public"));
app.set("view engine", "pug");

app.get("/", routes.index);
app.get("/login", routes.getLogin);
app.post("/login", passport.authenticate("local", {
	 successRedirect: "/",
	 failureRedirect: "/login"  // figure out {message: incorrect}
}));
app.get("/register", routes.getRegister);
app.post("/register", routes.postRegister);
app.get("/logout", routes.logout);

app.listen(config.port);
