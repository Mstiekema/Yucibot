var tmi 		= require('tmi.js');
var options		= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var clientID 	= options.identity.clientId
var CronJob 	= require('cron').CronJob;
var mkdirp 		= require('mkdirp');
var fs 			= require('fs');

module.exports = {

	updatePoints: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var info = {
  			url: 'https://api.twitch.tv/kraken/streams?channel=' + channel.substring(1),
 			headers: {
  			  'Client-ID': clientID
  			}
  		}

		var channel = JSON.stringify(options.channels).slice(2, -2);
		var job = new CronJob('*/1 * * * *', function() {
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
								var profFile = './static/user/_' + viewers[i] + '/profile.json';
								if (fs.existsSync(profFile)) {
									pointsGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
									pointsGet.profile.points = pointsGet.profile.points + 1
									fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
								}
								else {
									var profNew =
									"{\n" +
					  					'"profile": {\n' +
					    					'"level": 1,\n' +
					    					'"points": 0,\n' +
					    					'"lines": 0,\n' +
					    					'"isSub": false\n' +
					  					'}\n' +
									"}"
									mkdirp('./static/user/_' + viewers[i], function(err) {}); 
									fs.appendFile(profFile, profNew, function(err){
										if(err) {
											return;
										}
									});
								}
							}
						console.log("[DEBUG] Succesfully added points")
						});
			    	}
			  	}
			}
			request(info, callback)
		}, function () {}, true );
	},

	pointCommands: function () {
		bot.on('message', function (channel, user, message, self) {

			function toAdminLog(toLog) {
				var time = new Date(); 
				var day = time.getDate(); 
				var month = time.getMonth(); 
				var year = time.getFullYear();
				var hours = time.getHours(); 
				var minutes = time.getMinutes(); 
				var seconds = time.getSeconds();
				var logTime = "[" + day + '-' + month + '-' + year + " / " + hours + ':' + minutes + ':' + seconds + "] "
				var toLog = logTime + user.username + toLog
				getLog = JSON.parse(fs.readFileSync('./static/json/logs.json', 'utf8'))
				getLog.points.push(toLog)
				newLog = JSON.stringify(getLog)
				fs.writeFileSync('./static/json/logs.json', newLog)
			}

			if (message.startsWith("!roulette")) {
				var profFile = './static/user/_' + user.username + '/profile.json';
				var y = message.split(' ');
				var bet = y[1]

					if(fs.existsSync(profFile)) {
					var pointsGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
					var oldPoints = pointsGet.profile.points
					if(!isNaN(bet)) {
						if(oldPoints >= bet) {
							var x = Math.random() * 100
							if (x > 50) {									
								var q = parseInt(oldPoints)
								var r = parseInt(bet)
								var newPoints = q + r
								pointsGet.profile.points = newPoints
								fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
								bot.say(channel, user.username + ", You've won the roulette for " + bet  + " points! You now have " + newPoints + " points")
								var toLog = ' won ' + bet + ' points with roulette.'
								toAdminLog(toLog);
							}
							else {
								var q = parseInt(oldPoints)
								var r = parseInt(bet)
								var newPoints = q - r
								pointsGet.profile.points = newPoints
								fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
								bot.say(channel, user.username + ", You've lost the roulette for " + bet + " points! You now have " + newPoints + " points")
								var toLog = ' lost ' + bet + ' points with roulette.'
								toAdminLog(toLog);
							}								
						}
						else {
							bot.say(channel, user.username + ", You can't do roulette's with more points than you have")
						}
					}
					else if(bet === "all" || bet === "allin") {
						var x = Math.random() * 100
						if (x > 50) {									
							var q = parseInt(oldPoints)
							var newPoints = q + q
							pointsGet.profile.points = newPoints
							fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
							bot.say(channel, user.username + ", You've won the roulette for " + bet  + " points! You now have " + newPoints + " points")
							var toLog = ' won ' + bet + ' points with roulette.'
							toAdminLog(toLog);
						}
						else {
							var q = parseInt(oldPoints)
							var newPoints = q - q
							pointsGet.profile.points = newPoints
							fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
							bot.say(channel, user.username + ", You've lost the roulette for " + bet + " points! You now have 0 points")
							var toLog = ' lost ' + bet + ' points with roulette.'
							toAdminLog(toLog);
						}	
					}
					else {
						bot.say(channel, "I'm sorry, but that's not a valid roulette command " + user.username)
					}
				}
				else {
					console.log("[ERROR] User not found for roulette")
				}				
			}	

			if (message.startsWith("!slot")) {
				var profFile = './static/user/_' + user.username + '/profile.json';
				var emoteFile = JSON.parse(fs.readFileSync('./static/json/emotes.json', 'utf8'));
				var emoteCount = 4
				var setCount = 3
				var x = (parseInt([Math.floor(Math.random() * setCount)]) + 1).toString();
				var emotes = emoteFile.sets[x]
				var a = emotes[Math.floor(Math.random() * emoteCount)]
				var b = emotes[Math.floor(Math.random() * emoteCount)]
				var c = emotes[Math.floor(Math.random() * emoteCount)]

				if (fs.existsSync(profFile)) {
					var pointsGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
					var oldPoints = pointsGet.profile.points

					if (a == b && b == c) {
						var q = parseInt(oldPoints)
						var newPoints = q + 1000
						pointsGet.profile.points = newPoints
						fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
						bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! They are the same, you win 1000 points! PogChamp")
						var toLog = ' won 1000 points with the slot machine.'
						toAdminLog(toLog);
					}
					else if (a == b || b == c){
						var q = parseInt(oldPoints)
						var newPoints = q + 100
						pointsGet.profile.points = newPoints
						fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))					
						bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! So close, but yet so far FeelsBadMan You get 100 points")
						var toLog = ' won 100 points with the slot machine.'
						toAdminLog(toLog);
					}
					else if (a == c) {
						var q = parseInt(oldPoints)
						var newPoints = q + 10
						pointsGet.profile.points = newPoints
						fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))					
						bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! It's something SeemsGood You get 10 points")
						var toLog = ' won 10 points with the slot machine.'
						toAdminLog(toLog);
					}
					else {
						bot.say(channel, "| " + a + " | " + b + " | " + c + " | " + user.username + ", this is the result! Not Even close DansGame")
					}
				}
				else {}
			}			
		})
	}
}
