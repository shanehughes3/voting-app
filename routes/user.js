const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      db = require("../db.js"),
      auth = require("../auth.js");

// INDEX
router.get("/", function(req, res, next) {
    var locals = {};
    db.retrieveRecentPolls(req.query.offset || 0, function(err, polls) {
	if (err) {
	    if (err.name = "NoResults") {
		locals.message = "Sorry, no recent polls were found";
	    } else {
		locals.message = "Sorry, an unknown error occurred";
	    }
	    res.render("index", locals);
	} else {
	    locals.polls = polls;
	    locals.offset = req.query.offset || 0;
	    if (polls.length == 21) {
		locals.more = true;
		polls.pop();
	    }
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
	var locals = { user: req.user.username };
	db.retrieveUserPolls(req.user.username, req.query.offset || 0,
			     function(err, polls) {
	    if (err) {
		if (err.name = "NoResults") {
		    locals.message = "You don't have any polls yet";
		} else {
		    locals.message = "Sorry, an unknown error occurred";
		}
		res.render("profile", locals);
	    } else {
		locals.polls = polls;
		locals.offset = req.query.offset || 0;
		if (polls.length == 21) {
		    locals.more = true;
		    polls.pop();
		}
		res.render("profile", locals);
	    }
	});
    } else {
	res.redirect("/login");
    }
});

module.exports = router;
