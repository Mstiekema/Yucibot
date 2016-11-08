var tmi = require('tmi.js');
var options = require('./config.js')

var client = new tmi.client(options);
client.connect();

client.on('connected', function (channel) {
	console.log("Bot connected to channel")
	client.action("mstiekema", "Yucibot connected MrDestructoid")
});

client.on('message', function (channel, user, message, self) {
    if (message.startsWith("!test")) {
    	console.log("[DEBUG] Test command is working")
		client.say(channel, "This is a command xD")
		console.log(user)
	}
	else if (message.startsWith("!twitter")) {
		client.say(channel, "Merijn his Twitter is https://www.twitter.com/Mstiekema_")
	}
	else if (message.startsWith("!slap")) {
		client.say(channel, user.username + " slapped" + message.substring(message.indexOf(" ")) + " in the face")
	}
	else if (message.startsWith("!quit")) {
		if (user.mod === true) {
			client.say(channel, "Shutting down Yucibot MrDestructoid")
			client.disconnect()}
		else {
			client.say(channel, "You are not allowed to turn off the bot OMGScoots")
		};
	};
});

