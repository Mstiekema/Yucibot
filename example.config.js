module.exports = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "botname",
		admin: 'adminname',
		// Bot can't be the broadcaster or admin, don't use caps
		password: 'oauth:1234abcd',
		// You can get your oauth key from https://twitchapps.com/tmi/
		owUser: 'Battletag-1234',
		// Use a - instead of a # in your battle tag
		twitter: 'username',
		clientId: 'id',
		clientSecret: 'secret',
		redirectUrl: 'http://localhost:3000/login',
		// Get these at https://www.twitch.tv/kraken/oauth2/clients/new
		websiteUrl: 'http://localhost:3000',
	},
	apiKeys: {
		ytApiKey: 'apikey',
		// Fill in your API key, get it with this tutorial: bit.ly/getYTapikey
		twitter_consumer_key: 'example',
		twitter_consumer_secret: 'example',
		twitter_access_token_key: 'example',
		twitter_access_token_secret: 'example',
		// Get Twitter auth over at https://apps.twitter.com/
	}
	mysql: {
		user: 'username',
		password: 'password',
		database: 'yucibot'
	},
	channels: ["twitchchannel"] }

// Rename this file to config.js!
