var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var options 	= require('../config.js')
var request 	= require("request");
var clientID 	= options.identity.clientId

module.exports = {

	basicCommands: function () {

		bot.on('message', function (channel, user, message, self) {
			 if (message.startsWith("!test")) {
		    	bot.say(channel, "This is a command xD")
			   	console.log('Did the thing')
			}
			else if (message.startsWith("!twitter")) {
				bot.say(channel, channel.substring(1) + "'s Twitter is https://www.twitter.com/" + options.identity.twitter)
			}
			else if (message.startsWith("!repo") || message.startsWith("!github")) {
				bot.say(channel,"You can find the GitHub repo for the bot over at https://github.com/Mstiekema/Yucibot")
			}
			else if (message.startsWith("!slap")) {
				bot.say(channel, user.username + " slapped" + message.substring(message.indexOf(" ")) + " in the face")
			}
			else if (message.startsWith("1quit")) {
				if (user.mod === true || user.username == channel.substring(1)) {
					bot.say(channel, "Shutting down Yucibot MrDestructoid")
					bot.disconnect()}
				else {
					bot.say(channel, "You are not allowed to turn off the bot OMGScoots")
				};
			}
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
				function viewers(error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var info = JSON.parse(body).streams[0];
				    if(info != undefined) {
						bot.say(channel, channel.substring(1) + " has " + info.viewers + " viewers!")
				    }
				    else {
				    	console.log(channel.substring(1) + " is offline")
				    }
				  }
				}
				request(info, viewers)
			}
			else if(message.startsWith("!game")) {
				function game(error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var info = JSON.parse(body).streams[0];
				    if(info != undefined) {
						bot.say(channel, channel.substring(1) + " is currently playing " + info.game + "!")
				    }
				    else {
				    	console.log(info)
				    	console.log(channel.substring(1) + " is offline")
				    }
				  }
				}
				request(info, game)
			}
			else if(message.startsWith("!title")) {
				function title(error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var info = JSON.parse(body).streams[0];
				    if(info != undefined) {
						bot.say(channel, channel.substring(1) + "'s title is: " + info.channel.status + "!")
				    }
				    else {
				    	console.log(info)
				    	console.log(channel.substring(1) + " is offline")
				    }
				  }
				}
				request(info, title)
			}
		})
	}
}