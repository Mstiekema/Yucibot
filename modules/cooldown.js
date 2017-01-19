var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var clientID 	= options.identity.clientId

var cooldowns = [];

function cooldown(command, user, cooldown, time) {
	if(cooldowns.includes(user)) {
		if(cooldowns.user.includes(command)) {
			return bot.whisper(user, "The command that you're trying to use is still on cooldown, please wait :)")
		} else {
			cooldowns.push({"user": command})
			return
		}
	} else {
		cooldowns.push({"user": command})
		return
	}
}