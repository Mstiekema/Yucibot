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
    if (message === "!test") {
    	console.log("[DEBUG] Test command werkt")
		client.say("mstiekema", "This is a command xD")};
//	else if (message ==="!twitter") {
//		client.say("Mstiekema", "Merijn his Twitter is https://www.twitter.com/Mstiekema_")};
});

