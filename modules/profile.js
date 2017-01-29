var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var CronJob = require('cron').CronJob;
var request = require("request");
var connection = require("./connection.js")
var cd = require("./cooldown.js")
var clientID = options.identity.clientId

module.exports = {
	updateProfile: function (channel, user, message, self) {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var info = {
  		url: 'https://api.twitch.tv/kraken/streams?channel=' + channel.substring(1),
 			headers: {
  		  'Client-ID': clientID
  		}
  	}
		var job = new CronJob('*/5 * * * *', function() {
			function callback(error, response, body) {
				if (!error && response.statusCode == 200) {
					var info = JSON.parse(body).streams[0];
			    if(info != undefined) {
						var chatURL = "https://tmi.twitch.tv/group/user/" + channel.substring(1) + "/chatters";
						request(chatURL, function (error, response, body, channel) {
							var chatters = JSON.parse(body)
							var normViewers = chatters.chatters.viewers
							var moderators = chatters.chatters.moderators
							var viewers = normViewers.concat(moderators);
							for (var i = 0; i < viewers.length; i++) {
								var usern = viewers[i]
								connection.query('update user set points = points + 5 where name = ?', usern, function (err, result) {
									if (err) {
										return
									}
								})
							}
							console.log("[DEBUG] Succesfully added points")
						});
			    }
			  }
			}
			request(info, callback)
		}, function () {}, true );
		connection.query('select * from user where name = ?', user.username, function(err, result) {
			if (result[0] == undefined) {
				var userInfo = {
					name: user.username,
					points: 0,
					num_lines: 1,
					level: 100,
				}
				connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})
			} else {
				connection.query('update user set num_lines = num_lines + 1 where name = ?', user.username, function (err, result) {if (err) {return}})
			}
		})
		var logInfo = {
			name: user.username,
			log: message
		}
		connection.query('insert into chatlogs set ?', logInfo, function (err, result) {if (err) {return}})
	},
	fetchProfile: function(channel, user, message, self) {
		if (message.startsWith("!rq")) {
			function rq() {
			connection.query('SELECT * FROM chatlogs WHERE name = ? ORDER BY RAND() LIMIT 1', user.username, function (err, result) {
				bot.say(channel, user.username + " : " + result[0].log)
			})}
			cd.cooldown("rq", "user", user.username, 30, rq)
		}
		if (message.startsWith("!points")) {
			function points() {
			connection.query('select * from user where name = ?', user.username, function(err, result) {
				bot.whisper(user.username, "You have " + result[0].points + " points!")
			})}
			cd.cooldown("points", "global", user.username, 5, points)
		}
		if (message.startsWith("!lines")) {
			function lines() {
			connection.query('select * from user where name = ?', user.username, function(err, result) {
				bot.whisper(user.username, "You have written " + result[0].num_lines + " lines in this chat!")
			})}
			cd.cooldown("lines", "global", user.username, 20, lines)
		}
		if (message.startsWith("!totallines")) {
			function totallines() {
			connection.query('select * from chatlogs', function(err, result) {
				bot.say(channel, "Chat has written a total of " + result.length + " lines in this chat!")
			})}
			cd.cooldown("totallines", "global", user.username, 30, totallines)
		}
		if (message.startsWith("!addpoints")) {
			if (user.mod === true || user.username == channel.substring(1)) {
				var msg = message.split(" ");
				var points = parseInt(msg[2])
				var rec = msg[1]
				connection.query('update user set points = points + ' + points + ' where name = ?', rec, function (err, result) {
					if (err) {
						bot.whisper(user.username, "This isn't how you use this command. Usage: !addpoints USER POINTS")
						return
					} else {
						bot.whisper(user.username, "Succesfully added " + points + " to " + rec)
						var newLog = {type: "points", log: user.username + " added" + points + " points to " + rec}
						connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
					}
				})
			}
		}
		if (message.startsWith("!resetpoints")) {
			if (user.mod === true || user.username == channel.substring(1)) {
				var msg = message.split(" ");
				var rec = msg[1]
				connection.query('update user set points = 0 where name = ?', rec, function (err, result) {
					if (err) {
						bot.whisper(user.username, "Something went wrong with excuting the command. Please try again")
						return
					} else {
						bot.whisper(user.username, rec + "'s points have been succesfully reset")
						var newLog = {type: "points", log: rec + "'s points have been reset"}
						connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
					}
				})
			}
		}
	}
}
