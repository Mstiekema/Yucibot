var fs 			= require('fs');
var basic 		= require('./basic.js');
var overwatch 	= require('./ow.js');
var timers 		= require('./timers.js')
var profile 	= require('./profile.js')
var points 		= require('./points.js')
var songrequest	= require('./songrequest.js')
var dungeon 	= require('./dungeon.js')
var modules		= JSON.parse(fs.readFileSync('./static/json/modules.json', 'utf8')).modules[0]
var exp = module.exports = {}

exp.commands = function() {

	basic.basicCommands();
	profile.updateProfile();
	timers.fourtwenty();
	timers.twitter();
	songrequest.getSR();

	if(modules.twitchapi === true) {
		basic.useTwitchAPI();
	}
	else {
		console.log("[COMMANDS] TwitchAPI commands are disabled")
	}

	if(modules.overwatch === true) {
		overwatch.owCommands();
	}
	else {
		console.log("[COMMANDS] Overwatch commands are disabled")
	}

	if(modules.updatePoints === true) {
		points.updatePoints();
	}
	else {
		console.log("[COMMANDS] Point updates are disabled")
	}

	if(modules.pointCommands === true) {
		points.pointCommands();
	}
	else {
		console.log("[COMMANDS] Point commands are disabled")
	}

	if(modules.fetchProfile === true) {
		profile.fetchProfile();
	}
	else {
		console.log("[COMMANDS] Profile fetching commands are disabled")
	}

	if(modules.dungeon === true) {
		dungeon.dungeon();
	}
	else {
		console.log("[COMMANDS] Dungeon module is disabled")
	}
};