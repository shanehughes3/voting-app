const auth = require("../auth.js");

exports.index = function(req, res, next) {
    if (req.user) {
	res.render("index", {user: req.user.username});
    } else {
	res.render("index", {user: undefined});
    }
}

exports.getLogin = function(req, res, next) {
    res.render("login");
}

exports.getRegister = function(req, res, next) {
    res.render("register");
}

exports.postRegister = function(req, res, next) {
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
}

exports.logout = function(req, res) {
    req.logout();
    res.redirect("/");
}
