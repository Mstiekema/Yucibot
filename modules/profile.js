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
		var info1 = {
  		url: 'https://api.twitch.tv/kraken/streams/' + options.identity.channelId,
 			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
  		  'Client-ID': clientID
  		}
  	}
		new CronJob('*/5 * * * *', function() {
			function callback(error, response, body) {
				var streamStatus = JSON.parse(body).stream
				request("https://tmi.twitch.tv/group/user/" + channel.substring(1) + "/chatters", function (error, response, body, channel) {
					var chatters = JSON.parse(body)
					var normViewers = chatters.chatters.viewers
					var moderators = chatters.chatters.moderators
					var viewers = normViewers.concat(moderators);
					var pointAmount;
					var allViewers = new Array;
					var allIds = new Array;
					if(streamStatus != null) {
						for (var i = 0; i < viewers.length; i++) {
							var userName = viewers[i]
							var j = Math.floor(i / 100)
							if(!allViewers[j]) allViewers[j] = new Array;
							allViewers[j].push(userName)
						}
						func.connection.query('select * from modulesettings where moduleType = "updatePoints"', function(err, result) {
							pointAmount = result[0].value
						})
						for (var i = 0; i < allViewers.length; i++) {
							var info2 = {
								url: 'https://api.twitch.tv/kraken/users?login=' + allViewers[i].join(","),
								headers: {
									'Accept': 'application/vnd.twitchtv.v5+json',
									'Client-ID': clientID
								}
							}
							addPointsWithId(i)
							function addPointsWithId(i) {
								request(info2, function (error, response, body) {
									body = JSON.parse(body)
									for(var x = 0; x < body.users.length; x++) {
										var id = body.users[x]._id
										var user = allViewers[i][x]
										func.addPoints(id, pointAmount, user)
										func.addXP(id, 1, user)
										func.addTime(id, 5, user, "online")
									}
								})
							}
						}
					} else {
						for (var i = 0; i < viewers.length; i++) {
							var userName = viewers[i]
							var j = Math.floor(i / 100)
							if(!allViewers[j]) allViewers[j] = new Array;
							allViewers[j].push(userName)
						}
						for (var i = 0; i < allViewers.length; i++) {
							var info2 = {
								url: 'https://api.twitch.tv/kraken/users?login=' + allViewers[i].join(","),
								headers: {
									'Accept': 'application/vnd.twitchtv.v5+json',
									'Client-ID': clientID
								}
							}
							addPointsWithId(i)
							function addPointsWithId(i) {
								request(info2, function (error, response, body) {
									body = JSON.parse(body)
									for(var x = 0; x < body.users.length; x++) {
										var id = body.users[x]._id
										var user = allViewers[i][x]
										func.addTime(id, 5, user, "offline")
									}
								})
							}
						}
					}
					console.log("[DEBUG] Updated stats")
				});
			}
			request(info1, callback)
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
		var userName = user.username
		if (user['user-id'] == undefined) {
			func.connection.query('select * from user where name = ?', userName, function(err, result) {
				if (result[0] == undefined) {
					var userInfo = {
						name: userName,
						userId: user['user-id'],
						points: 0,
						num_lines: 1,
						level: 100,
					}
					getID(user.username)
					func.connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})
					func.connection.query('insert into userstats set userId = ?', user['user-id'], function (err, result) {if (err) {return}})
				} else if (result[0].userId == null) {
					getID(user.username)
					func.connection.query('update user set num_lines = num_lines + 1 where name = ?', userName, function (err, result) {if (err) {return}})
					func.connection.query('insert into userstats set userId = ?', user['user-id'], function (err, result) {if (err) {return}})
				} else {
					func.connection.query('update user set num_lines = num_lines + 1 where name = ?', userName, function (err, result) {if (err) {return}})
				}
			})
			var logInfo = {
				userId: user['user-id'],
				log: message
			}
			func.connection.query('insert into chatlogs set ?', logInfo, function (err, result) {if (err) {return}})
		}
		func.connection.query('select * from user where userId = ?', user['user-id'], function(err, result) {
			if (result[0] == undefined) {
				var userInfo = {
					name: user.username,
					userId: user['user-id'],
					points: 0,
					num_lines: 1,
					level: 100,
				}
				getID(user.username)
				func.connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})
				func.connection.query('insert into userstats set userId = ?', user['user-id'], function (err, result) {if (err) {return}})
			} else if (result[0].name != userName) {
				func.connection.query('update user set name = "' + userName + '" where userId = ?', user['user-id'], function (err, result) {if (err) {return}})
			} else if (result[0].userId == null) {
				getID(user.username)
				func.connection.query('update user set num_lines = num_lines + 1 where userId = ?', user['user-id'], function (err, result) {if (err) {return}})
				func.connection.query('insert into userstats set userId = ?', user['user-id'], function (err, result) {if (err) {return}})
			} else {
				func.connection.query('update user set num_lines = num_lines + 1 where userId = ?', user['user-id'], function (err, result) {if (err) {return}})
			}
		})
		var logInfo = {
			userId: user['user-id'],
			log: message
		}
		func.connection.query('insert into chatlogs set ?', logInfo, function (err, result) {if (err) {return}})
	},
	fetchProfile: function(channel, user, message, self) {
		if (message[0] == "!rq") {
			function rq() {
			func.connection.query('SELECT * FROM chatlogs WHERE userId = ? ORDER BY RAND() LIMIT 1', user['user-id'], function (err, result) {
				bot.say(channel, user.username + " : " + result[0].log)
			})}
			func.cooldown("rq", "user", user.username, 30, rq)
		}
		if (message[0] == "!points") {
			function points() {
			func.connection.query('select * from user where name = ?', user.username, function(err, result) {
				bot.whisper(user.username, "You have " + result[0].points + " points!")
			})}
			func.cooldown("points", "global", user.username, 5, points)
		}
		if (message[0] == "!userpoints") {
			function userpoints() {
				if(message[1]) user.username = message[1]
				func.connection.query('select * from user where name = ?', user.username, function(err, result) {
					bot.say(channel, user.username + " has " + result[0].points + " points!")
				})
			}
			func.cooldown("userpoints", "global", user.username, 5, userpoints)
		}
		if (message[0] == "!lines") {
			function lines() {
			func.connection.query('select * from user where username = ?', user.username, function(err, result) {
				bot.whisper(user.username, "You have written " + result[0].num_lines + " lines in this chat!")
			})}
			func.cooldown("lines", "global", user.username, 20, lines)
		}
		if (message[0] == "!totallines") {
			function totallines() {
			func.connection.query('select * from chatlogs', function(err, result) {
				bot.say(channel, "Chat has written a total of " + result.length + " lines in this chat!")
			})}
			func.cooldown("totallines", "global", user.username, 30, totallines)
		}
		if (message[0] == "!addpoints") {
			if (user.mod === true || user.username == channel.substring(1)) {
				var points = parseInt(message[2])
				var rec = message[1]
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
		if (message[0] == "!resetpoints") {
			if (user.mod === true || user.username == channel.substring(1)) {
				var rec = message[1]
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
