var basic = require('./basic.js');
var profile = require('./profile.js')
var points = require('./points.js')
var songrequest	= require('./songrequest.js')
var mod = require('./mod.js')
var events = require('./events.js')
var func = require("./functions.js")
var clr = require("./clrCommands.js")
var emotes = require("./emotes.js")
var quotes = require("./quotes.js")
var connect = require('../app.js')
var bot = connect.bot
var exp = module.exports = {}

exp.commands = function(channel, user, message, self) {
	var msg = message.toLowerCase().split(" ")

	func.connection.query('select * from module', function(err, result) {
		if (result[1].state == 1) {
			if (result[8].state == 1) { basic.useTwitchAPI(channel, user, msg, self); }
			if (result[9].state == 1) { basic.customCommands(channel, user, msg, self); }
			if (result[9].state == 1) { mod.commandManagement(channel, user, message.split(" "), self); }
			if (result[10].state == 1) { songrequest.getSongs(channel, user, message.split(" "), self); }
			if (result[11].state == 1) { emotes.track(channel, user, msg, self, message) }
			if (result[11].state == 1) { emotes.getStats(channel, user, msg, self) }
		}
		if (result[2].state == 1) {
			if (result[12].state == 1) { basic.google(channel, user, msg, self); }
			if (result[13].state == 1) { basic.owCommands(channel, user, msg, self); }
			if (result[29].state == 1) { quotes.addQuote(channel, user, msg, self, message); }
			if (result[29].state == 1) { quotes.getQuotes(channel, user, msg, self); }
		}
		if (result[3].state == 1) {
			if (result[14].state == 1) { points.roulette(channel, user, msg, self); }
			if (result[15].state == 1) { points.slot(channel, user, msg, self); }
			if (result[16].state == 1) { points.dungeon(channel, user, msg, self); }
			if (result[31].state == 1) { points.pickpocket(channel, user, msg, message, self); }
			if (result[30].state == 1) { points.raffle(channel, user, msg, self); }
		}
		if (result[4].state == 1) {
			if (result[17].state == 1) { profile.updateLines(channel, user, message, self); }
			if (result[19].state == 1) { profile.fetchProfile(channel, user, msg, self); }
		}
		if (result[5].state == 1) {
			if (result[22].state == 1) { basic.lastTweet(channel, user, msg, self); }
		}
		if (result[6].state == 1) {
			if (result[23].state == 1) { mod.mod(channel, user, msg, self); }
			if (result[24].state == 1) { mod.link(channel, user, msg, self); }
		}
		if (result[7].state == 1) {
			if (result[25].state == 1) { clr.clrComm(channel, user, msg, self, message); }
			if (result[26].state == 1) { clr.emotes(channel, user, msg, self) }
		}
	})
	if (msg[0] == "!quit") {
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
		events.customTimers();
		if (result[4].state == 1) {
			if (result[18].state == 1) { profile.updateProfile(); }
		}
		if (result[5].state == 1) {
			if (result[20].state == 1) { events.sub(); }
			if (result[21].state == 1) { events.fourtwenty(); }
			if (result[22].state == 1) { events.twitter(); }
		}
	})
};
