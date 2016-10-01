const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      db = require("../db.js"),
      auth = require("../auth.js");

// INDEX
router.get("/", function(req, res, next) {
    var locals = {};
    db.retrieveRecentPolls(function(err, polls) {
	if (err) {
	    if (err.name = "NoResults") {
		locals.message = "Sorry, no recent polls were found";
	    } else {
		locals.message = "Sorry, an unknown error occurred";
	    }
	} else {
	    locals.polls = polls;
	    if (req.user) {
		locals.user = req.user.username;
	    }
	    res.render("index", locals);
	}
    });
});

// LOGIN
router.get("/login", function(req, res, next) {
    res.render("login");
});

router.post("/login", passport.authenticate("local", {failWithError: true}),
	    loginSuccess, loginFailure);

function loginSuccess(req, res, next) {
    res.redirect("/profile");
}

function loginFailure(err, req, res, next) {
    if (err.name == "AuthenticationError") {
	res.render("login", {message: "Invalid username or password"});
    } else {
	res.render("login", {message: "Sorry, an unknown error has occurred"});
    }
}

// REGISTER
router.get("/register", function(req, res, next) {
    res.render("register");
});

router.post("/register", function(req, res, next) {
    auth.register(req, res, function(err, user) {
	if (err) {
	    if (err.name = "UserExistsError") {
		res.render("register", {
		    message: "Sorry, that username is already taken."
		});
	    } else {
		res.render("register", {
		    message: "Sorry, an unknown error occurred."
		});
	    }
	} else {
	    res.redirect(307, "/login");
	}
    });
});

// LOGOUT
router.get("/logout", function(req, res, next) {
    req.logout();
    res.redirect("/");
});

// PROFILE
router.get("/profile", function(req, res, next) {
    if (req.user) {
	db.retrieveUserPolls(req.user.username, function(err, polls) {
	    if (err) {
		var locals = {user: req.user.username};
		if (err.name = "NoResults") {
		    locals.message = "You don't have any polls yet";
		} else {
		    locals.message = "Sorry, an unknown error occurred";
		}
		res.render("profile", locals);
	    } else {
		res.render("profile", {
		    user: req.user.username,
		    polls: polls
		});
	    }
	});
    } else {
	res.redirect("/login");
    }
});

module.exports = router;
