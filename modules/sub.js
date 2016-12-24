var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var options 	= require('../config.js')
var request 	= require("request");
var fs 			= require('fs');

module.exports = {
	sub: function () {
		bot.on("resub", function (channel, username, months, message) {
		    bot.say(channel, "Thanks " + username + " for resubbing " + months + " months in a row! PogChamp //")
		});
		bot.on("subscription", function (channel, username, method) {
    		bot.say(channel, "Thanks " + username + " for subbing to " + channel.substring(1) + "! PogChamp")
		});
	}
}