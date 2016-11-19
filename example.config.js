module.exports = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "Botname",
		password: 'oauth:1234abcd',
		// You can get your oauth key from https://twitchapps.com/tmi/
		owUser: 'Battletag-1234'
		// Use a - instead of a # in your battle tag
	},
	channels: ["#TwitchChannel"] }

// Rename this file to config.js!