var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var CronJob = require('cron').CronJob;
var request = require("request");
var func = require("./functions.js")
var clientID = options.identity.clientId

module.exports = {
	updateProfile: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var info = {
  		url: 'https://api.twitch.tv/kraken/streams?channel=' + channel.substring(1),
 			headers: {
  		  'Client-ID': clientID
  		}
  	}
		new CronJob('*/5 * * * *', function() {
			function callback(error, response, body) {
				if(JSON.parse(body).streams[0] != undefined) {
					request("https://tmi.twitch.tv/group/user/" + channel.substring(1) + "/chatters", function (error, response, body, channel) {
						var chatters = JSON.parse(body)
						var normViewers = chatters.chatters.viewers
						var moderators = chatters.chatters.moderators
						var viewers = normViewers.concat(moderators);
						for (var i = 0; i < viewers.length; i++) {
							var userName = viewers[i]
							func.addPoints(userName, 5)
						}
						console.log("[DEBUG] Succesfully added points")
					});
				}
			}
			request(info, callback)
		}, function () {}, true );
	},
	updateLines: function(channel, user, message, self) {
		function getID(user) {
			var info = {
				url: 'https://api.twitch.tv/kraken/users?login=' + user,
				headers: {
					'Accept': 'application/vnd.twitchtv.v5+json',
					'Client-ID': clientID
				}
			}
			request(info, function (error, response, body) {
				var id = JSON.parse(body).users[0]._id
				func.connection.query('update user set userId = "' + id + '" where name = ?', user, function (err, result) {if (err) {return}})
			})
		}
		func.connection.query('select * from user where name = ?', user.username, function(err, result) {
			if (result[0] == undefined) {
				var userInfo = {
					name: user.username,
					points: 0,
					num_lines: 1,
					level: 100,
				}
				getID(user.username)
				func.connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})
			} else if (result[0].userId == null) {
				getID(user.username)
				func.connection.query('update user set num_lines = num_lines + 1 where name = ?', user.username, function (err, result) {if (err) {return}})
			} else {
				func.connection.query('update user set num_lines = num_lines + 1 where name = ?', user.username, function (err, result) {if (err) {return}})
			}
		})
		var logInfo = {
			name: user.username,
			log: message
		}
		func.connection.query('insert into chatlogs set ?', logInfo, function (err, result) {if (err) {return}})
	},
	fetchProfile: function(channel, user, message, self) {
		if (message.startsWith("!rq")) {
			function rq() {
			func.connection.query('SELECT * FROM chatlogs WHERE name = ? ORDER BY RAND() LIMIT 1', user.username, function (err, result) {
				bot.say(channel, user.username + " : " + result[0].log)
			})}
			func.cooldown("rq", "user", user.username, 30, rq)
		}
		if (message.startsWith("!points")) {
			function points() {
			func.connection.query('select * from user where name = ?', user.username, function(err, result) {
				bot.whisper(user.username, "You have " + result[0].points + " points!")
			})}
			func.cooldown("points", "global", user.username, 5, points)
		}
		if (message.startsWith("!lines")) {
			function lines() {
			func.connection.query('select * from user where name = ?', user.username, function(err, result) {
				bot.whisper(user.username, "You have written " + result[0].num_lines + " lines in this chat!")
			})}
			func.cooldown("lines", "global", user.username, 20, lines)
		}
		if (message.startsWith("!totallines")) {
			function totallines() {
			func.connection.query('select * from chatlogs', function(err, result) {
				bot.say(channel, "Chat has written a total of " + result.length + " lines in this chat!")
			})}
			func.cooldown("totallines", "global", user.username, 30, totallines)
		}
		if (message.startsWith("!addpoints")) {
			if (user.mod === true || user.username == channel.substring(1)) {
				var msg = message.split(" ");
				var points = parseInt(msg[2])
				var rec = msg[1]
				func.connection.query('update user set points = points + ' + points + ' where name = ?', rec, function (err, result) {
					if (err) {
						bot.whisper(user.username, "This isn't how you use this command. Usage: !addpoints USER POINTS")
						return
					} else {
						bot.whisper(user.username, "Succesfully added " + points + " to " + rec)
						var newLog = {type: "points", log: user.username + " added" + points + " points to " + rec}
						func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
					}
				})
			}
		}
		if (message.startsWith("!resetpoints")) {
			if (user.mod === true || user.username == channel.substring(1)) {
				var msg = message.split(" ");
				var rec = msg[1]
				func.connection.query('update user set points = 0 where name = ?', rec, function (err, result) {
					if (err) {
						bot.whisper(user.username, "Something went wrong with excuting the command. Please try again")
						return
					} else {
						bot.whisper(user.username, rec + "'s points have been succesfully reset")
						var newLog = {type: "points", log: rec + "'s points have been reset"}
						func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
					}
				})
			}
		}
	}
}
