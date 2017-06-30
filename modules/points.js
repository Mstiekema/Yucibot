var tmi = require('tmi.js');
var options	= require('../config.js')
var func = require("./functions.js")
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var CronJob = require('cron').CronJob;
var participants = new Array;
var winArr = new Array;
var rafState = false;
var time = 30 * 1000;
var points;

module.exports = {
	roulette: function (channel, user, message, self) {
		if (message[0] == "!roulette") {
			function roulette() {
			func.connection.query('select * from user where name = ?', user.username, function (err, result) {
				var bet = message[1]
				var oldPoints = result[0].points
				if(!isNaN(bet)) {
					if(oldPoints >= bet) {
						var x = Math.random() * 100
						if (x > 50) {
							var r = parseInt(bet)
							func.connection.query('update user set points = points + ' + r + ' where name = ?', user.username, function (err, result) {if (err) {return}})
							bot.say(channel, user.username + ", You've won the roulette for " + bet  + " points! You now have " + (r + oldPoints) + " points! FeelsGoodMan")
							var newLog = {type: "points", log: user.username + " won " + bet + " in roulette"}
							func.addStats(user['user-id'], "roul", "Win", bet)
							func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
						}
						else {
							var r = parseInt(bet)
							func.connection.query('update user set points = points - ' + r + ' where name = ?', user.username, function (err, result) {if (err) {return}})
							bot.say(channel, user.username + ", You've lost the roulette for " + bet + " points! You now have " + (oldPoints - r) + " points! FeelsBadMan")
							var newLog = {type: "points", log: user.username + " lost " + bet + " in roulette"}
							func.addStats(user['user-id'], "roul", "Loss", "-"+bet)
							func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
						}
					} else if (0 >= oldPoints) {
						bot.whisper(user.username, "You can't roulette with negative points")
					}	else {
						bot.whisper(user.username, "You can't roulette with more points than you currently have")
					}
				}
				else if(bet === "all" || bet === "allin") {
					var x = Math.random() * 100
					if (x > 50) {
						func.connection.query('update user set points = points + points where name = ?', user.username, function (err, result) {if (err) {return}})
						bot.say(channel, user.username + ", You've won the roulette for " + oldPoints  + " points! You now have " + (parseInt(oldPoints) + parseInt(oldPoints)) + " points! FeelsGoodMan")
						var newLog = {type: "points", log: user.username + " won " + oldPoints + " in roulette"}
						func.addStats(user['user-id'], "roul", "Win", oldPoints)
						func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
					}
					else {
						func.connection.query('update user set points = 0 where name = ?', user.username, function (err, result) {if (err) {return}})
						bot.say(channel, user.username + ", You've lost the roulette for " + oldPoints + " points! You now have 0 points FeelsBadMan")
						var newLog = {type: "points", log: user.username + " lost " + oldPoints + " in roulette"}
						func.addStats(user['user-id'], "roul", "Loss", "-"+oldPoints)
						func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
					}
				}
				else {
					bot.say(channel, "I'm sorry, but that's not a valid roulette command " + user.username)
				}
			})}
			func.connection.query('select * from modulesettings where moduleType = "roulette"', function(err, result) {
				var bet = message[1]
				var minBet = result[0].value
				var cd = result[1].value
				if (bet < minBet) {
					bot.whisper(user.username, "You have to roulette atleast " + minBet + " points.")
				} else {
					func.cooldown("roulette", "user", user.username, cd, roulette)
				}
			})
		}
	},
	slot: function (channel, user, message, self) {
		if (message[0] == ("!slot")) {
			function slot() {
			var sets = {
				"1":["Kappa", "Keepo", "PogChamp", "EleGiggle"],
				"2":["SeemsGood", "DansGame", "FeelsGoodMan", "FeelsBadMan"],
				"3":["LUL", "DatSheffy ", "haHAA", "FailFish"]
			}
			var x = (parseInt([Math.floor(Math.random() * 3)]) + 1).toString();
			var emotes = sets[x]
			var a = emotes[Math.floor(Math.random() * 4)]
			var b = emotes[Math.floor(Math.random() * 4)]
			var c = emotes[Math.floor(Math.random() * 4)]
			if (a == b && b == c) {
				func.connection.query('update user set points = points + 500 where name = ?', user.username, function (err, result) {if (err) {return}})
				bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! They are the same, you win 500 points! PogChamp")
				var newLog = {type: "points", log: user.username + " won 500 points with the slot machine"}
				func.addStats(user['user-id'], "slot", "Win", 500)
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			}
			else if (a == b || b == c){
				func.connection.query('update user set points = points + 50 where name = ?', user.username, function (err, result) {if (err) {return}})
				bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! So close, but yet so far FeelsBadMan You get 50 points")
				var newLog = {type: "points", log: user.username + " won 50 points with the slot machine"}
				func.addStats(user['user-id'], "slot", "Win", 50)
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			}
			else if (a == c) {
				func.connection.query('update user set points = points - 50 where name = ?', user.username, function (err, result) {if (err) {return}})
				bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! It's something, but you lose 50 points EleGiggle")
				var newLog = {type: "points", log: user.username + " lost 50 points with the slot machine"}
				func.addStats(user['user-id'], "slot", "Loss", -50)
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			}
			else {
				func.connection.query('update user set points = points - 100 where name = ?', user.username, function (err, result) {if (err) {return}})
				bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! What is this? You got nothing? You lose 100 points LUL")
				var newLog = {type: "points", log: user.username + " lost 100 points with the slot machine"}
				func.addStats(user['user-id'], "slot", "Loss", -100)
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			}}
			func.connection.query('select * from modulesettings where moduleType = "slot"', function(err, result) {
				var cd = result[0].value
				func.cooldown("slot", "user", user.username, cd, slot)
			})
		}
	},
	dungeon: function (channel, user, message, self) {
		if (message[0] == "!startdungeon" && (user.username === channel.substring(1) || user.mod === true)) {
			func.connection.query('update module set state = 1 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
			bot.say(channel, "The dungeon queue has started! Type !enter in the chat to join the queue")
			function doDungeonOpt(chance) {
				func.connection.query('SELECT * FROM dungeon',  function(err, result) {
					var participants = result
					bot.say(channel, "Leeeeet's do this! " + participants.length + " adventurers are entering the dungeon!")
					var winP = ((participants.length * Math.random()) * chance)
					var winners = Math.floor(winP / 110) + 1
					if (winners > 7) {
						winners = winners - 3
						var pointPool = participants.length * 100
						poolDiv = Math.floor(pointPool / winners)
						for(x = 0; x < winners; ++x) {
							var i = Math.floor(Math.random() * participants.length);
							var winner = participants[i]
							var getUserInfo = {
								url: 'https://api.twitch.tv/kraken/users?login=' + userName,
								headers: {
									'Accept': 'application/vnd.twitchtv.v5+json',
									'Client-ID': clientID
								}
							}
							request(getUserInfo, function (error, response, body) {
								var id = JSON.parse(body).users[0]._id
								func.addStats(id, "dung", "Win", poolDiv)
								func.connection.query('update user set points = points + ' + parseInt(poolDiv) + ' where name = ?', winner, function (err, result) {if (err) {console.log(err)}})
								func.connection.query('update dungeon set win = 1 where user = ?', winner, function (err, result) {if (err) {console.log("err")}})
							})
						}
						bot.say(channel, getFile.winners + " each won " + poolDiv + " points! PogChamp //")
						func.connection.query('TRUNCATE dungeon',  function(err, result) {if (err) {console.log(err)}})
						func.connection.query('update module set state = 0 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
					} else {
						var pointPool = participants.length * 100
						poolDiv = Math.floor(pointPool / winners)
						for(x = 0; x < winners; ++x) {
							var i = Math.floor(Math.random() * participants.length);
							var winner = participants[i]
							var getUserInfo = {
								url: 'https://api.twitch.tv/kraken/users?login=' + userName,
								headers: {
									'Accept': 'application/vnd.twitchtv.v5+json',
									'Client-ID': clientID
								}
							}
							request(getUserInfo, function (error, response, body) {
								var id = JSON.parse(body).users[0]._id
								func.addStats(id, "dung", "Win", poolDiv)
								func.connection.query('update user set points = points + ' + parseInt(poolDiv) + ' where name = ?', winner, function (err, result) {if (err) {console.log(err)}})
								func.connection.query('update dungeon set win = 1 where user = ?', winner, function (err, result) {if (err) {console.log("err")}})
							})
						}
						func.connection.query('SELECT * FROM dungeon WHERE win = 1',  function(err, result) {
							allWinners = result.map(function(a) {return a.user;})
							bot.say(channel, allWinners + " each won " + poolDiv + " points! PogChamp //")
							var newLog = {type: "points", log: allWinners + " won " + poolDiv + " points with the dungeon"}
							func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
						})
						func.connection.query('TRUNCATE dungeon',  function(err, result) {if (err) {console.log(err)}})
						func.connection.query('update module set state = 0 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
					}
				})
			}
			function doDungeon() {
				func.connection.query('SELECT * FROM dungeon',  function(err, result) {
					var participants = result
					if (participants.length < 10) {
						bot.say(channel, "Less than 10 people joined the dungeon party, this isn't enough to start the dungeon FeelsBadMan")
						func.connection.query('TRUNCATE dungeon',  function(err, result) {if (err) {console.log(err)}})
						func.connection.query('update module set state = 1 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
					}
					else if (participants.length < 50) {
						doDungeonOpt(30)
					}
					else if (participants.length < 75) {
						doDungeonOpt(25)
					}
					else if (participants.length < 100) {
						doDungeonOpt(20)
					}
					else if (participants.length < 125) {
						doDungeonOpt(10)
					}
					else if (participants.length < 150) {
						doDungeonOpt(7)
					}
					else if (participants.length > 150) {
						doDungeonOpt(5)
					}
					else {
						bot.say(channel, "A weird error occured, please contact Mstiekema if you see this :/")
					}
				})
			}
			setTimeout(doDungeon, 120000)
		}
		if (message[0] == "!enter") {
			func.connection.query('select * from module where moduleName = "dungeonActive"', function(err, result) {
				if (result[0].state == 1) {
					func.connection.query('SELECT * FROM dungeon WHERE user = ?', user.username, function(err, result) {
						if (result[0] == undefined) {
							func.connection.query('insert into dungeon set ? ', {user: user.username}, function (err, result) {if (err) {console.log(err)}})
							bot.whisper(user.username, "You succesfully joined the dungeon! Good luck PogChamp")
						} else {
							bot.whisper(user.username, "I'm sorry but you can't participate multiple times :/")
						}
					})
				} else {
					bot.whisper(user.username, "There's no dungeon currently active :/")
				}
			})
		}
	},
	raffle: function (channel, user, message, self) {
		if ((user.mod || user.username == channel.substring(1)) && (message[0] == "!raffle" && rafState == false)) {
			points = parseInt(message[1])
			if(message[2]) {time = parseInt(message[2] * 1000)}
			rafState = true
			participants.length = 0
			
			bot.say(channel, "A raffle has started! Type !join to join the raffle for " + points + " points!")
			setTimeout(function () {
				bot.say(channel, "Type !join to join the raffle for " + points + " points! You have " + (time * 0.75) / 1000 + " seconds left!")
			}, time * 0.25);
			setTimeout(function () {
				bot.say(channel, "Type !join to join the raffle for " + points + " points! You have " + (time * 0.5) / 1000 + " seconds left!")
			}, time * 0.5);
			setTimeout(function () {
				bot.say(channel, "Type !join to join the raffle for " + points + " points! You have " + (time * 0.25) / 1000 + " seconds left!")
			}, time * 0.75);
			setTimeout(function () {
				if (participants.length == 0) return bot.say(channel, "No one joined the raffle FeelsBadMan")
				winArr.length = 0
				var winP = ((participants.length * Math.random()) * 30)
				var winners = Math.floor(winP / 110) + 1
				var wPoints = Math.floor(points / winners)
				for(x = 0; x < winners; ++x) {
					var i = Math.floor(Math.random() * participants.length);
					var winner = participants[i]
					func.connection.query('update user set points = points + ' + parseInt(wPoints) + ' where name = ?', winner, function (err, result) {if (err) {console.log(err)}})
					winArr.push(winner)
				}
				bot.say(channel, "The raffle is over! " + winners + " users won " + wPoints + "! The winners are: " + winArr)
				rafState = false
			}, time);
		}
		
		if (message[0] == "!join") {
			if ((user.username.indexOf(participants) == -1 || participants[0] == undefined) && rafState == true) {
				participants.push(user.username)
			} else {
				return
			}
		}
	}
}
