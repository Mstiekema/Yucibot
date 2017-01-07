var basic 		= require('./basic.js');
var overwatch 	= require('./ow.js');
var timers 		= require('./timers.js')
var profile 	= require('./profile.js')
var points 		= require('./points.js')
var songrequest	= require('./songrequest.js')
var mod 		= require('./mod.js')
var events 		= require('./events.js')
var connection 	= require("./connection.js")
var exp = module.exports = {}

exp.commands = function() {
	connection.query('select * from module', function(err, result) {
		if (result[0].state == 1) {
			basic.useTwitchAPI()
		}
		if (result[1].state == 1) {
			basic.basicCommands()
		}
		if (result[2].state == 1) {
			overwatch.owCommands();
		}
		if (result[3].state == 1) {
			profile.updateProfile();
		}
		if (result[4].state == 1) {
			profile.fetchProfile();
		}
		if (result[5].state == 1) {
			points.roulette();
		}
		if (result[6].state == 1) {
			points.slot();
		}
		if (result[7].state == 1) {
			points.dungeon();
		}
		if (result[8].state == 1) {
			timers.fourtwenty();
		}
		if (result[9].state == 1) {
			timers.twitter();
		}
		if (result[10].state == 1) {
			songrequest.getSongs();
		}
		if (result[11].state == 1) {
			mod.mod();
		}
		if (result[12].state == 1) {
			events.sub();
		}
		if (result[13].state == 1) {
			events.timeout();
		}
	})
};