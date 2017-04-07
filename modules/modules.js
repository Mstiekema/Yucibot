var basic = require('./basic.js');
var profile = require('./profile.js')
var points = require('./points.js')
var songrequest	= require('./songrequest.js')
var mod = require('./mod.js')
var events = require('./events.js')
var func = require("./functions.js")
var clr = require("./clrCommands.js")
var emotes = require("./emotes.js")
var connect = require('../app.js')
var bot = connect.bot
var exp = module.exports = {}

exp.commands = function(channel, user, message, self) {
	var msg = message.toLowerCase().split(" ")

	func.connection.query('select * from module', function(err, result) {
		if (result[1].state == 1) {
			basic.useTwitchAPI(channel, user, msg, self);
			basic.customCommands(channel, user, msg, self);
			mod.commandManagement(channel, user, msg, self);
			songrequest.getSongs(channel, user, msg, self);
			emotes.track(channel, user, msg, self)
			emotes.getStats(channel, user, msg, self)
		}
		if (result[2].state == 1) {
			basic.google(channel, user, msg, self);
			basic.owCommands(channel, user, msg, self);
		}
		if (result[3].state == 1) {
			points.roulette(channel, user, msg, self);
			points.slot(channel, user, msg, self);
			points.dungeon(channel, user, msg, self);
		}
		if (result[4].state == 1) {
			profile.updateLines(channel, user, message, self);
			profile.fetchProfile(channel, user, msg, self);
		}
		if (result[6].state == 1) {
			mod.mod(channel, user, msg, self);
			mod.link(channel, user, msg, self);
		}
		if (result[7].state == 1) {
			clr.clrComm(channel, user, msg, self);
		}
	})
	if (msg[0] == "1quit") {
		if (user.mod === true || user.username == channel.substring(1)) {
			bot.say(channel, "Shutting down Yucibot MrDestructoid")
			bot.disconnect()
			process.exit(1)
		}
	}
};

exp.events = function(channel, user, message, self) {
	func.connection.query('select * from module', function(err, result) {
		events.timeout();
		if (result[4].state == 1) {
			profile.updateProfile(channel, user, message, self);
		}
		if (result[5].state == 1) {
			events.sub();
			events.fourtwenty();
			events.twitter();
		}
	})
};
