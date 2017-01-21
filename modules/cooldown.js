var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var clientID 	= options.identity.clientId
var cooldowns 	= [];

module.exports = {
	cooldown: function(command, type, user, cooldown, exc) {
		var toCD = user + command
		var cd = cooldown * 1000
		if(type == "user") {
			if (cooldowns.includes(toCD)) {
				return
			} else {
				cooldowns.push(toCD)
				setTimeout(function() {
					var index = cooldowns.indexOf(toCD);
				    cooldowns.splice(index, 1);
				}, cd);
				exc()
			}
		} else {
			if (cooldowns.includes(command)) {
				return
			} else {
				cooldowns.push(command)
				setTimeout(function() {
					var index = cooldowns.indexOf(command);
				    cooldowns.splice(index, 1);
				}, cd);
				exc()
			}
		}
	}
}