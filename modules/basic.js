var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot

module.exports = {

basicCommands: function () {

bot.on('message', function (channel, user, message, self) {
	 if (message.startsWith("!test")) {
    	bot.say(channel, "This is a command xD")
	   	console.log('Did the thing')
	}
	else if (message.startsWith("!twitter")) {
		bot.say(channel, "Merijn his Twitter is https://www.twitter.com/Mstiekema_")
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
}
}