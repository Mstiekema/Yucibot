var tmi = require('tmi.js');
var options = require('./config.js')
var request = require("request");
var bot = new tmi.client(options);
module.exports.bot = bot;
var commands = require('./modules/modules.js')

bot.connect();

bot.on('connected', function (channel, user, message, self) {
	console.log("[DEBUG] Bot connected to channel")
});

process.on('uncaughtException', function(err) {
    console.log(err)
});

commands.commands();