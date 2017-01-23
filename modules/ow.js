var tmi 	= require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var cd 		= require("./cooldown.js")
var bot 	= connect.bot
var request = require("request");

module.exports = {
	owCommands: function () {
		bot.on('message', function(channel, user, message, self) {
			if(message.startsWith("!owrank")) {
				function owrank() {
				if(message.length < 8) {
					request('https://api.lootbox.eu/pc/eu/' + options.identity.owUser + '/profile', function (error, response, body) {
					var rank = JSON.parse(body);
					bot.say(channel, channel.substring(1) + " is op het moment rank " + rank.data.competitive.rank + " in Overwatch! PogChamp")});
				}
				else {
					var userOW = message.split(' ');
					request('https://api.lootbox.eu/pc/eu/' + userOW[1] + '/profile', function (error, response, body) {
						var rank = JSON.parse(body);
						bot.say(channel, userOW[1] + " is op het moment rank " + rank.data.competitive.rank + " in Overwatch! PogChamp")});
				}}
				cd.cooldown("owrank", "global", user.username, 10, owrank)
			};
		});
	}
}