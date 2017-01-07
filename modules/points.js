var tmi 		= require('tmi.js');
var options		= require('../config.js')
var connection 	= require("./connection.js")
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var CronJob 	= require('cron').CronJob;

module.exports = {
	roulette: function () {
		bot.on('message', function (channel, user, message, self) {
			if (message.startsWith("!roulette")) {
				connection.query('select * from user where name = ?', user.username, function (err, result) {
					var y = message.split(' ');
					var bet = y[1]
					var oldPoints = result[0].points
					if(!isNaN(bet)) {
						if(oldPoints >= bet) {
							var x = Math.random() * 100
							if (x > 50) {									
								var r = parseInt(bet)
								connection.query('update user set points = points + ' + r + ' where name = ?', user.username, function (err, result) {if (err) {return}})
								bot.say(channel, user.username + ", You've won the roulette for " + bet  + " points!")
								var newLog = {type: "points", log: user.username + " won " + bet + " in roulette"}
								connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
							}
							else {
								var r = parseInt(bet)
								connection.query('update user set points = points - ' + r + ' where name = ?', user.username, function (err, result) {if (err) {return}})
								bot.say(channel, user.username + ", You've lost the roulette for " + bet + " points!")
								var newLog = {type: "points", log: user.username + " lost " + bet + " in roulette"}
								connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
							}								
						}
						else {
							bot.say(channel, user.username + ", You can't do roulette's with more points than you have")
						}
					}
					else if(bet === "all" || bet === "allin") {
						var x = Math.random() * 100
						if (x > 50) {									
							connection.query('update user set points = points + points where name = ?', user.username, function (err, result) {if (err) {return}})
							bot.say(channel, user.username + ", You've won the roulette for " + bet  + " points!")
							var newLog = {type: "points", log: user.username + " won " + bet + " in roulette"}
							connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
						}
						else {
							connection.query('update user set points = 0 where name = ?', user.username, function (err, result) {if (err) {return}})
							bot.say(channel, user.username + ", You've lost the roulette for " + bet + " points!")
							var newLog = {type: "points", log: user.username + " lost " + bet + " in roulette"}
							connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
						}	
					}
					else {
						bot.say(channel, "I'm sorry, but that's not a valid roulette command " + user.username)
					}
				})
			}
		})
	},
	slot: function () {
		bot.on('message', function (channel, user, message, self) {
			if (message.startsWith("!slot")) {
				var sets = {
					"1":["Kappa", "Keepo", "PogChamp", "OMGScoots"],
					"2":["SeemsGood", "DansGame", "FeelsGoodMan", "FeelsBadMan"],
					"3":["LUL", "DatSheffy ", "haHAA", "FailFish"]
				}
				var x = (parseInt([Math.floor(Math.random() * 3)]) + 1).toString();
				var emotes = sets[x]
				var a = emotes[Math.floor(Math.random() * 4)]
				var b = emotes[Math.floor(Math.random() * 4)]
				var c = emotes[Math.floor(Math.random() * 4)]
				if (a == b && b == c) {
					connection.query('update user set points = points + 1000 where name = ?', user.username, function (err, result) {if (err) {return}})
					bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! They are the same, you win 1000 points! PogChamp")
					var newLog = {type: "points", log: user.username + " won 1000 points with the slot machine"}
					connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
				}
				else if (a == b || b == c){
					connection.query('update user set points = points + 100 where name = ?', user.username, function (err, result) {if (err) {return}})
					bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! So close, but yet so far FeelsBadMan You get 100 points")
					var newLog = {type: "points", log: user.username + " won 100 points with the slot machine"}
					connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
				}
				else if (a == c) {
					connection.query('update user set points = points + 10 where name = ?', user.username, function (err, result) {if (err) {return}})
					bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! It's something SeemsGood You get 10 points")
					var newLog = {type: "points", log: user.username + " won 10 points with the slot machine"}
					connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
				}
				else {
					bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! Not Even close DansGame")
				}
			}			
		})
	}, 
	dungeon: function () {
		bot.on('message', function(channel, user, message, self) {
			if (message.startsWith("!startdungeon") && (user.username === channel.substring(1) || user.mod === true)) {
				connection.query('update module set state = 1 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
				bot.say(channel, "The dungeon queue has started! Type !enter in the chat to join the queue")
				function doDungeonOpt(chance) {
					connection.query('SELECT * FROM dungeon',  function(err, result) {
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
									connection.query('update user set points = points + ' + parseInt(poolDiv) + ' where name = ?', winner, function (err, result) {if (err) {console.log(err)}})
									connection.query('update dungeon set win = 1 where user = ?', winner, function (err, result) {if (err) {console.log("err")}})
							}
							bot.say(channel, getFile.winners + " each won " + poolDiv + " points! PogChamp //")
							connection.query('TRUNCATE dungeon',  function(err, result) {if (err) {console.log(err)}})
							connection.query('update module set state = 0 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
						} else {
							var pointPool = participants.length * 100
							poolDiv = Math.floor(pointPool / winners)
							for(x = 0; x < winners; ++x) {
								var i = Math.floor(Math.random() * participants.length);
								var winner = participants[i]
								connection.query('update user set points = points + ' + parseInt(poolDiv) + ' where name = ?', winner.user, function (err, result) {if (err) {console.log(err)}})
								connection.query('update dungeon set win = 1 where user = ?', winner.user, function (err, result) {if (err) {console.log("err")}})
							}
							connection.query('SELECT * FROM dungeon WHERE win = 1',  function(err, result) {
								allWinners = result.map(function(a) {return a.user;})
								bot.say(channel, allWinners + " each won " + poolDiv + " points! PogChamp //")
								var newLog = {type: "points", log: allWinners + " won " + poolDiv + " points with the dungeon"}
								connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
							})
							connection.query('TRUNCATE dungeon',  function(err, result) {if (err) {console.log(err)}})
							connection.query('update module set state = 0 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
						}
					})
				}
				function doDungeon() {
					connection.query('SELECT * FROM dungeon',  function(err, result) {
						var participants = result
						if (participants.length < 10) {
							bot.say(channel, "Less than 10 people joined the dungeon party, this isn't enough to start the dungeon FeelsBadMan")
							connection.query('TRUNCATE dungeon',  function(err, result) {if (err) {console.log(err)}})
							connection.query('update module set state = 1 where moduleName = "dungeonActive"', function (err, result) {if (err) {console.log(err)}})
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
			if (message.startsWith("!enter")) {
				connection.query('select * from module where moduleName = "dungeonActive"', function(err, result) {
					if (result[0].state == 1) {
						connection.query('SELECT * FROM dungeon WHERE user = ?', user.username, function(err, result) {
							if (result[0] == undefined) {
								connection.query('insert into dungeon set ? ', {user: user.username}, function (err, result) {if (err) {console.log(err)}})
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
		});
	}
}