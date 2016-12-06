var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var CronJob = require('cron').CronJob;
var request = require("request");
var mkdirp = require('mkdirp');
var fs = require('fs');

module.exports = {

	fourtwenty: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var job = new CronJob('00 20 16 * * *', function() {
			console.log("[DEBUG] 4:20 Timer initiated"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip")
		}, function () {}, true );
	},

	twitter: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var job = new CronJob('*/20 * * * *', function() {
			bot.say(channel, "Follow me on Twitter: " + options.identity.twitter)
			}, function () {}, true );
	}
}