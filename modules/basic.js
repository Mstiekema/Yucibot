var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var cd 			= require("./cooldown.js")
var clientID 	= options.identity.clientId

module.exports = {
	basicCommands: function () {
		bot.on('message', function (channel, user, message, self) {
			if (message.startsWith("!test")) {
		    	function test() {
		    		bot.say(channel, "This is a command xD")
			   		console.log('Did the thing')
			   	}
			   	cd.cooldown("test", "global", user.username, 10, test)
			}
			else if (message.startsWith("!twitter")) {
				function twitter() {bot.say(channel, channel.substring(1) + "'s Twitter is https://www.twitter.com/" + options.identity.twitter)}
				cd.cooldown("twitter", "global", user.username, 10, twitter)
			}
			else if (message.startsWith("!repo") || message.startsWith("!github")) {
				function repo() {bot.say(channel,"You can find the GitHub repo for the bot over at https://github.com/Mstiekema/Yucibot")}
				cd.cooldown("repo", "global", user.username, 10, repo)
			}
			else if (message.startsWith("!slap")) {
				function slap() {bot.say(channel, user.username + " slapped" + message.substring(message.indexOf(" ")) + " in the face")}
				cd.cooldown("slap", "global", user.username, 10, slap)
			}
			else if (message.startsWith("!google")) {
				function google() {
				var q = message.substring(message.indexOf(" ") + 1);
				var question = q.split(' ').join('+');
				var base = "https://www.google.nl/search?q=";
				var link = base + question
				bot.say(channel, user.username + " Google is je beste vriend! " + link)}
				cd.cooldown("google", "global", user.username, 10, google)
			}
			else if (message.startsWith("!lmgtfy")) {
				function lmgtfy() {
				var q = message.substring(message.indexOf(" ") + 1);
				var question = q.split(' ').join('+');
				var base = "https://lmgtfy.com/?q=";
				var link = base + question
				bot.say(channel, user.username + " Google is je beste vriend! " + link)}
				cd.cooldown("lmgtfy", "global", user.username, 10, lmgtfy)
			}
			// else if (message.startsWith("1quit")) {
			// 	if (user.mod === true || user.username == channel.substring(1)) {
			// 		bot.say(channel, "Shutting down Yucibot MrDestructoid")
			// 		bot.disconnect()}
			// 	else {
			// 		bot.say(channel, "You are not allowed to turn off the bot OMGScoots")
			// 	};
			// }
			else if (message.includes("Alliance") || message.includes("alliance")) {
				bot.say(channel, "LOK'TAR OGAR, FOR THE HORDE SMOrc")
			};
		});
	},
	useTwitchAPI: function () {
		bot.on('message', function(channel, user, message, self) {
			var info = {
	  			url: 'https://api.twitch.tv/kraken/streams?channel=' + channel.substring(1),
	  			headers: {
	  			  'Client-ID': clientID
	  			}
			};
			if(message.startsWith("!viewers")) {
				function getViewers(error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var info = JSON.parse(body).streams[0];
				    if(info != undefined) {
						bot.say(channel, channel.substring(1) + " has " + info.viewers + " viewers!")
				    }
				    else {
				    	bot.say(channel, channel.substring(1) + " is offline")
				    }
				  }
				}
				function viewers() {request(info, getViewers)}
				cd.cooldown("viewers", "global", user.username, 10, viewers)
			}
			else if(message.startsWith("!game")) {
				function getGame(error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var info = JSON.parse(body).streams[0];
				    if(info != undefined) {
						bot.say(channel, channel.substring(1) + " is currently playing " + info.game + "!")
				    }
				    else {
				    	bot.say(channel, channel.substring(1) + " is offline")
				    }
				  }
				}
				function game() {request(info, getGame)}
				cd.cooldown("game", "global", user.username, 10, game)
			}
			else if(message.startsWith("!title")) {
				function getTitle(error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var info = JSON.parse(body).streams[0];
				    if(info != undefined) {
						bot.say(channel, channel.substring(1) + "'s title is: " + info.channel.status + "!")
				    }
				    else {
				    	bot.say(channel, channel.substring(1) + " is offline")
				    }
				  }
				}
				function title() {request(info, getTitle)}
				cd.cooldown("title", "global", user.username, 10, title)
			}
		})
	}
}