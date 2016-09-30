const passport = require("passport"),
      LocalStrategy = require("passport-local").Strategy,
      mongoose = require("mongoose"),
      db = require("./db.js"),
      User = db.user;

exports.register = function(req, res, cb) {
    debugger;
    User.register(new User({
	username: req.body.username,
	votes: req.session.votes
    }), req.body.password, function(err, user) {
	if (err) {
	    console.log(err);
	    cb(err);
	} else {
	    cb(null, user);
	}
    });
}
