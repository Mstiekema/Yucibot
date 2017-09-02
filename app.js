var tmi = require('tmi.js');
var options = require('./config.js')
var bot = new tmi.client(options);
module.exports.bot = bot;
var commands = require('./modules/modules.js')
var web = require('./website.js')

web.connect();
bot.connect();

bot.on('logon', function (channel, user, message, self) {
	console.log("[DEBUG] Bot connected to channel")
	setTimeout(function () { bot.say(JSON.stringify(options.channels).slice(2, -2), "Yucibot is now running MrDestructoid") }, 500);
});

process.on('uncaughtException', function(err) {
  console.log(err)
});

bot.on("message", function (channel, user, message, self) {
  commands.commands(channel, user, message, self);
})

commands.events()