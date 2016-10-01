const passport = require("passport"),
      LocalStrategy = require("passport-local").Strategy,
      mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      passportLocalMongoose = require("passport-local-mongoose"),
      db = require("./db.js");

// USER REGISTRATION
var UserSchema = new Schema({});
UserSchema.plugin(passportLocalMongoose);
UserSchema.add({ votes: [] });

var User = mongoose.model("User", UserSchema);
exports.user = User;

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
