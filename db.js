const config = require("./config.js"),
      mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      shortid = require("shortid"),
      auth = require("./auth.js"),
      User = auth.user;

mongoose.Promise = global.Promise; // silence DeprecationWarning

const db = mongoose.connect(config.db);

// PRIVATE FUNCTIONS
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

function checkClientVote(poll, sessionVotes, user, cb) {
    if (user) {
	if (user.username == poll.owner) {
	    cb(null, poll, true);
	} else {
	    checkUserVote(user._id, poll, cb);
	}
    } else {
	if (sessionVotes.indexOf(poll._id) == -1) {
	    cb(null, poll, false);
	} else {
	    cb(null, poll, true);
	}
    }
}

function checkUserVote(userID, poll, cb) {
    User.findOne({
	_id: userID
    }, "votes", function(err, user) {
	if (err) {
	    cb(err);
	} else if (user.votes.indexOf(poll._id) == -1) {
	    cb(null, poll, false);
	} else {
	    cb(null, poll, true);
	}
    });
}

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

function recordSessionVote(req, pollID, cb) {
    req.session.votes.push(pollID);
    cb(null);
}

// POLL MODEL
var pollSchema = new Schema({
    _id: {type: String, "default": shortid.generate},
    title: String,
    options: [{option: String, votes: Number}],
    owner: String
}, { timestamps: true });

var Poll = mongoose.model("Poll", pollSchema);

// POLL CREATE/RETRIEVE
exports.createPoll = function(req, cb) {
    if (sanitizeNewPollRequest(req, cb)) {
	var options = req.body.options;
	options = options.filter(o => o); // purge empty fields
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

exports.retrievePoll = function(pollID, sessionVotes, user, cb) {
    Poll.findOne({
	_id: pollID
    }, "title options _id owner", function(err, poll) {
	if (err) {
    	    cb(err)
	} else if (poll == null) {
	    returnNoResults(cb);
	} else {
	    checkClientVote(poll, sessionVotes, user, cb);
	}
    });
}

exports.retrieveUserPolls = function(user, offset, cb) {
    Poll.find({
	owner: user
    }, "title _id", {
	sort: {"createdAt": -1},
	skip: parseInt(offset),
	limit: 21
    }, function(err, polls) {
	if (err) {
	    cb(err);
	} else if (polls.length == 0) {
	    returnNoResults(cb);
	} else {
	    cb(null, polls);
	}
    });
}

exports.retrieveRecentPolls = function(offset, cb) {
    Poll.find({}, "title _id owner",
	      { skip: parseInt(offset),
		limit: 21,
		sort: {"createdAt": -1}
	      }, 
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

// VOTE
exports.vote = function(req, cb) {
    if (req.body.option == "new-option" && req.body.newOption) {
	// add new option and vote for it
	Poll.update({
	    _id: req.body.id,
	}, {
	    $push: {options: {
		option: req.body.newOption,
		votes: 1
	    }}}, callback);
    } else { // preexisting option
	Poll.update({
	    _id: req.body.id,
	    "options._id": req.body.option
	}, {
	    $inc: { "options.$.votes": 1 }
	}, callback);
    }
	
    function callback(err, doc) {
	if (err) {
	    cb(err);
	} else if (doc.nModified == 0) {
	    var e = new Error("Vote was not recorded");
	    e.name = "VoteError";
	    cb(e);
	} else {
	    if (req.user) {
		recordUserVote(req.user._id, req.body.id, cb);
	    } else {
		recordSessionVote(req, req.body.id, cb);
	    }
	}
    }
}

// DELETE
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
