var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var clientID 	= options.identity.clientId

var cooldowns = [];

module.exports = {
	cooldown: function(command, user, cooldown, exc) {
		var toCD = user + command
		var cd = cooldown * 1000
		console.log(toCD)
		if (cooldowns.includes(toCD)) {
			return false
		} else {
			cooldowns.push(toCD)
			setTimeout(function() {
				var index = cooldowns.indexOf(toCD);
			    cooldowns.splice(index, 1);
			}, cd);
			return true
		}
	}
}