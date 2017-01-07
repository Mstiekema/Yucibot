var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var connection 	= require("./connection.js")

module.exports = {
	sub: function () {
		bot.on("resub", function (channel, username, months, message) {
		    bot.say(channel, "Thanks " + username + " for resubbing " + months + " months in a row to " + channel + "! PogChamp //")
		    var newLog = {type: "resub", log: username + " subbed for " + months + " months to " + channel + " with the following message: " + message}
			connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
		bot.on("subscription", function (channel, username, method) {
			bot.say(channel, "Thanks " + username + " for subbing to " + channel.substring(1) + "! PogChamp")
			var newLog = {type: "sub", log: username + " subbed to " + channel}
			connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
	},
	timeout: function() {
		bot.on("ban", function (channel, username, reason) {
			var newLog = {type: "ban", log: username + " has been banned for the following reason: " + reason}
			connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
		bot.on("timeout", function (channel, username, reason, duration) {
			var newLog = {type: "timeout", log: username + " has been timed out for the following reason: " + reason}
			connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
	},
}