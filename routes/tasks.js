const auth = require("../auth.js"),
      express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      db = require("../db.js");

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
	}
	if (req.user) {
	    locals.user = req.user.username;
	}
	res.render("index", locals);
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

// CREATE POLL
router.get("/create", function(req, res, next) {
    if (req.user) {
	res.render("create", {user: req.user.username});
    } else {
	res.redirect("/login");
    }
});

function handlePollCreationError(err, req, res) {
    if (err.name = "CompletionError") {
	res.render("create", {message: err.message});
    } else if (err.name = "AuthenticationError") {
	res.redirect("/login");
    } else {
	console.log(err);
	res.render("create", {
	    message: "Sorry, an unknown error occurred"
	});
    }
}

router.post("/create", function(req, res, next) {
    db.createPoll(req, function(err, newID) {
	if (err) {
	    handlePollCreationError(err, req, res);
	} else {
	    res.redirect("/view/" + newID);
	}
    });
});

// VIEW POLLS
router.get("/view", function(req, res, next) {
    res.redirect("/");
});

function handlePollViewErrors(err, res) {
    if (err.name = "NoResults") {
	res.render("view", {
	    message: "Sorry, that poll does not exist"
	});
    } else {
	res.render("view", {message: "Error retrieving poll"});
    }
}

router.get("/view/:pollID", function(req, res, next) {
    db.retrievePoll(req.params.pollID, req.session.votes,
		    req.user, function(err, poll, voted) {
	if (err) {
	    handlePollViewErrors(err, res);
	} else {	    
	    var locals = {
		poll: poll,
		user: (req.user) ? req.user.username : null,
		vote: !voted
	    };
	    if (req.user && req.user.username == poll.owner) {
		locals.edit = true;
	    }
	    res.render("view", locals);
	} 
    });
});

router.post("/vote", function(req, res, next) {
    db.vote(req, function(err) {
		if (err) {
		    console.log("err");
		    res.send("error");
		} else {
		    res.redirect("/view/" + req.body.id);
		}
	    });
});

// DELETE POLL
router.get("/delete/:pollID", function(req, res, next) {
    db.retrievePoll(req.params.pollID, function(err, poll) {
	if (err) {
	    handlePollViewErrors(err, res);
	} else if (req.user && poll.owner == req.user.username) {
	    res.render("delete-verify", {
		user: req.user.username,
		poll: poll
	    });
	} else {
	    redirect("/login");
	}
    });
});

router.post("/delete", function(req, res, next) {
    if (req.user && req.body.user == req.user.username) {
	db.deletePoll(req.body.id, function(err) {
	    if (err) {
		res.render("delete-confirm", {
		    user: req.user.username,
		    message: "An error occurred - the poll was not deleted."
		});
	    } else {
		res.render("delete-confirm", {
		    user: req.user.username,
		    message: "Your poll was successfully deleted."
		});
	    }
	});
    } else {
	res.redirect("/login");
    }
});
    
module.exports = router;
