var auth_token = require('./auth_token.js')

module.exports = {
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
	channels: ["#mstiekema"] }