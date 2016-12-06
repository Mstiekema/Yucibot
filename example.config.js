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
		owUser: 'Battletag-1234',
		// Use a - instead of a # in your battle tag
		ytApiKey: 'apikey',
		// Fill in your API key, get it with this tutorial: bit.ly/getYTapikey
		clientId: 'id',
		clientSecret: 'secret'
		// Get these at https://www.twitch.tv/kraken/oauth2/clients/new
	},
	channels: ["#TwitchChannel"] }

// Rename this file to config.js!