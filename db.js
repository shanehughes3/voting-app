const config = require("./config.js"),
      mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      passportLocalMongoose = require("passport-local-mongoose"),
      shortid = require("shortid");

mongoose.Promise = global.Promise; // silence DeprecationWarning

const db = mongoose.connect(config.db);

// USER REGISTRATION
var User = new Schema({});
User.plugin(passportLocalMongoose);
User.add({ votes: [] });

exports.user = mongoose.model("User", User);

// POLL CREATE/RETRIEVE/DELETE
var pollSchema = new Schema({
    _id: {type: String, "default": shortid.generate},
    title: String,
    options: [{option: String, votes: Number}],
    owner: String
});

var Poll = mongoose.model("Poll", pollSchema);

function returnNoResults(cb) {
    var e = new Error("No results found");
    e.name = "NoResults";
    cb(e);
}

function sanitizeNewPollRequest(req, cb) {
    // returns false if error passed to cb
    if (req.body.title == "") {
	var e = new Error("Poll must contain a question");
	e.name = "CompletionError";
	cb(e);
	return false;
    } else if (!req.user) {
	var e = new Error("User is not logged in");
	e.name = "AuthenticationError";
	cb(e);
	return false;
    } else {
	return true;
    }    
}

exports.createPoll = function(req, cb) {
    if (sanitizeNewPollRequest(req, cb)) {
	var options = req.body.options;
	options = options.filter(o => o); // sanitize empty fields
	options = options.map(o => {return {option: o, votes: 0}});
	var newPoll = new Poll({
	    title: req.body.title,
	    options: options,
	    owner: req.user.username
	});
	newPoll.save(function(err) {
	    if (err) {
		cb(err);
	    } else {
		cb(null, newPoll._id);
	    }
	});
    }
}

exports.retrievePoll = function(pollID, cb) {
    Poll.findOne({
	_id: pollID
    }, "title options _id owner", function(err, poll) {
	if (err) {
    	    cb(err)
	} else if (poll == null) {
	    returnNoResults(cb);
	} else {
	    cb(null, poll);
	}
    });
}

exports.retrieveUserPolls = function(user, cb) {
    Poll.find({
	owner: user
    }, "title _id", function(err, polls) {
	if (err) {
	    cb(err);
	} else if (polls.length == 0) {
	    returnNoResults(cb);
	} else {
	    cb(null, polls);
	}
    });
}

exports.retrieveRecentPolls = function(cb) {
    Poll.find({}, "title _id owner",
	      { limit: 20 }, 
	      function(err, polls) {
		  if (err) {
		      cb(err);
		  } else if (polls.length == 0) {
		      returnNoResults(cb);
		  } else {
		      cb(null, polls);
		  }
	      });
}
/* FIX
function recordUserVote(userID, pollID, cb) {
    User.findOneAndUpdate({
	_id: userID
    }, {
	$push: { votes: pollID }
    }, function(err, doc) {
	if (err) {
	    cb(err);
	} else {
	    cb(null);
	}
    });
}

exports.vote = function(pollID, optionID, userID, cb) {
    Poll.findOneAndUpdate({
	_id: pollID,
	options._id: optionID
    }, {
	$inc: { options.$.votes: 1 }
    }, function(err, doc) {
	if (err) {
	    cb(err);
	} else {
	    recordUserVote(userID, pollID, cb);
	}
    }
}
*/
exports.deletePoll = function(pollID, cb) {
    Poll.findOneAndRemove({
	_id: pollID
    }, function(err, doc) {
	if (err) {
	    cb(err);
	} else if (doc == null) {
	    var e = new Error("No documents were deleted");
	    e.name = "DeletionError";
	    cb(e);
	} else {
	    cb(null);
	}
    });
}
