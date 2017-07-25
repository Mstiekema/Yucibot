var tmi = require('tmi.js');
var Twitter = require('twitter');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var CronJob = require('cron').CronJob;
var request = require("request");
var func = require("./functions.js")

module.exports = {
	sub: function () {
		func.connection.query('select * from modulesettings where moduleType = "subNotif"', function(err, result) {
			bot.on("resub", function (channel, username, months, message, userstate, method) {
				var resubMsg = result[1].message
				var plan;
				if(method.plan == 1000) plan = '4,99 euro'
				if(method.plan == 2000) plan = '9,99 euro'
				if(method.plan == 3000) plan = '24,99 euro'
				if(method.prime == true) plan = "Prime"
				resubMsg = resubMsg.replace("[username]", username).replace("[months]", months).replace("[plan]", plan);
				bot.say(channel, resubMsg);
				var newLog = {type: "sub", log: username + " resubbed for " + months + " months using a " + plan + " sub with the following message: " + message}
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			});
			
			bot.on("subscription", function (channel, username, method, message, userstate) {
				var subMsg = result[0].message
				var plan;
				if(method.plan == 1000) plan = '4,99 euro'
				if(method.plan == 2000) plan = '9,99 euro'
				if(method.plan == 3000) plan = '24,99 euro'
				if(method.prime == true) plan = "Prime"
				subMsg = subMsg.replace("[username]", username).replace("[plan]", plan);
				bot.say(channel, subMsg);
				var newLog = {type: "sub", log: username + " subbed to " + channel + " with a " + plan + " sub."}
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			});
		})
	},
	timeout: function() {
		bot.on("ban", function (channel, username, reason) {
			var newLog = {type: "timeout", log: username + " has been banned for the following reason: " + reason}
			func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
		bot.on("timeout", function (channel, username, reason, duration) {
			var newLog = {type: "timeout", log: username + " has been timed out for the following reason: " + reason}
			func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
	},
	fourtwenty: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var job = new CronJob('00 20 16 * * *', function() {
			console.log("[DEBUG] 4:20 Timer initiated"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip")
		}, function () {}, true );
	},
	twitter: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var client = new Twitter({
			consumer_key: options.apiKeys.twitter_consumer_key,
			consumer_secret: options.apiKeys.twitter_consumer_secret,
			access_token_key: options.apiKeys.twitter_access_token_key,
			access_token_secret: options.apiKeys.twitter_access_token_secret
		});
		client.get('users/show', {'screen_name': options.identity.twitter}, function(error, usr, response) {
			client.stream('statuses/filter', {'follow': usr.id_str}, function(stream) {
				stream.on('data', function(event) {
					if(event.user.id != usr.id_str) return
					if(event.text.startsWith("@")) return
					bot.say(channel, "New tweet! PogChamp | " + event.text + " | " + "https://www.twitter.com/"+event.user["screen_name"]+"/status/"+event.id_str)
				});
				stream.on('error', function(error) {
					throw error;
				});
			});
		})
	},}