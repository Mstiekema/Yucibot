var tmi = require('tmi.js');
var options = require('./config.js')
var request = require("request");
var bot = new tmi.client(options);
module.exports.bot = bot;
var commands = require('./modules/commands.js')

var CronJob = require('cron').CronJob;
var mkdirp = require('mkdirp');
var fs = require('fs');

bot.connect();

bot.on('connected', function (channel, user, message, self) {
	console.log("[DEBUG] Bot connected to channel")
});

process.on('uncaughtException', function(err) {
    console.log(err)
});

commands.commands();

var channel = JSON.stringify(options.channels).slice(2, -2);
var updatePoints = new CronJob('*/1 * * * *', function() {
	var chatURL = "https://tmi.twitch.tv/group/user/" + channel.substring(1) + "/chatters";
	request(chatURL, function (error, response, body, channel) {
		var chatters = JSON.parse(body)
		var normViewers = chatters.chatters.viewers
		var moderators = chatters.chatters.moderators
		var viewers = normViewers.concat(moderators);
		for (var i = 0; i < viewers.length; i++) {
			var profFile = './user/_' + viewers[i] + '/profile.json';
			if (fs.existsSync(profFile)) {
					var file = require(profFile);
					pointsGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
					pointsGet.profile.points = pointsGet.profile.points + 5
					fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
			}
			else {
				var profFile = './user/_' + viewers[i] + '/profile.json';
				var profNew =
				"{\n" +
  					'"profile": {\n' +
    					'"points": 0,\n' +
    					'"lines": 0\n' +
  					'}\n' +
				"}"
				mkdirp('./user/_' + viewers[i], function(err) {}); 
				fs.appendFile(profFile, profNew, function(err){
					if(err) {
						return;
					}
				});
			}
		}
	});
	console.log("Succesfully added 5 points")
	}, function () {
  },
  true
);