var tmi = require('tmi.js');
var auth_token = require('./auth_token.js')

var options = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "Yucibot",
		password: auth_token
	},
	channels: ["mstiekema"]
};


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
	}
	else if (message.startsWith("!twitter")) {
		client.say(channel, "Merijn his Twitter is https://www.twitter.com/Mstiekema_")
	}
	else if (message.startsWith("!slap")) {
		client.say(channel, user.username + " slapped" + message.substring(message.indexOf(" ")) + " in the face")
	};
});

