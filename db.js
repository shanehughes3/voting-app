const config = require("./config.js"),
      mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      passportLocalMongoose = require("passport-local-mongoose");

mongoose.Promise = global.Promise; // silence DeprecationWarning

const db = mongoose.connect(config.db);

var User = new Schema({});

User.plugin(passportLocalMongoose);

exports.user = mongoose.model("User", User);

