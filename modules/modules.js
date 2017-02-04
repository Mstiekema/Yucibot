var basic = require('./basic.js');
var profile = require('./profile.js')
var points = require('./points.js')
var songrequest	= require('./songrequest.js')
var mod = require('./mod.js')
var events = require('./events.js')
var streaminfo = require('./streaminfo.js')
var connection = require("./connection.js")
var exp = module.exports = {}

exp.commands = function(channel, user, message, self) {
	basic.customCommands(channel, user, message, self)
	mod.commandManagement(channel, user, message, self)
	connection.query('select * from module', function(err, result) {
		if (result[1].state == 1) {
			basic.useTwitchAPI(channel, user, message, self)
		}
		if (result[2].state == 1) {
			basic.basicCommands(channel, user, message, self)
		}
		if (result[3].state == 1) {
			basic.owCommands(channel, user, message, self)
		}
		if (result[5].state == 1) {
			profile.fetchProfile(channel, user, message, self);
		}
		if (result[6].state == 1) {
			points.roulette(channel, user, message, self);
		}
		if (result[7].state == 1) {
			points.slot(channel, user, message, self);
		}
		if (result[8].state == 1) {
			points.dungeon(channel, user, message, self);
		}
		if (result[11].state == 1) {
			songrequest.getSongs(channel, user, message, self);
		}
		if (result[12].state == 1) {
			mod.mod(channel, user, message, self);
		}
		if (result[13].state == 1) {
			mod.link(channel, user, message, self);
		}
	})
};

exp.events = function(channel, user, message, self) {
	streaminfo.fetchInfo()
	connection.query('select * from module', function(err, result) {
		if (result[4].state == 1) {
			profile.updateProfile(channel, user, message, self);
		}
		if (result[9].state == 1) {
			events.fourtwenty();
		}
		if (result[10].state == 1) {
			events.twitter();
		}
		if (result[14].state == 1) {
			events.sub();
		}
		if (result[15].state == 1) {
			events.timeout();
		}
	})
};
