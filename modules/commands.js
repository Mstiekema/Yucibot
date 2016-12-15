var basic 		= require('./basic.js');
var overwatch 	= require('./ow.js');
var timers 		= require('./timers.js')
var profile 	= require('./profile.js')
var points 		= require('./points.js')
var songrequest	= require('./songrequest.js')
var dungeon 	= require('./dungeon.js')

var exp = module.exports = {}

exp.commands = function() {
	basic.useTwitchAPI();
	basic.basicCommands();
	overwatch.owCommands();
	points.updatePoints();
	points.pointCommands();
	timers.fourtwenty();
	timers.twitter();
	profile.updateProfile();
	profile.fetchProfile();
	songrequest.getSR();
	dungeon.dungeon();
};