var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var clientID = options.identity.clientId
var CronJob = require('cron').CronJob;
var mkdirp = require('mkdirp');
var fs = require('fs');

module.exports = {

	updatePoints: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var info = {
  			url: 'https://api.twitch.tv/kraken/streams?channel=' + channel.substring(1),
 			headers: {
  			  'Client-ID': clientID
  			}
  		}

		var channel = JSON.stringify(options.channels).slice(2, -2);
		var job = new CronJob('*/1 * * * *', function() {
			function callback(error, response, body) {
				if (!error && response.statusCode == 200) {
					var info = JSON.parse(body).streams[0];
			    	if(info != undefined) {
						var chatURL = "https://tmi.twitch.tv/group/user/" + channel.substring(1) + "/chatters";
						request(chatURL, function (error, response, body, channel) {
							var chatters = JSON.parse(body)
							var normViewers = chatters.chatters.viewers
							var moderators = chatters.chatters.moderators
							var viewers = normViewers.concat(moderators);
							for (var i = 0; i < viewers.length; i++) {
								var profFile = './user/_' + viewers[i] + '/profile.json';
								if (fs.existsSync(profFile)) {
									pointsGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
									pointsGet.profile.points = pointsGet.profile.points + 1
									fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
								}
								else {
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
						console.log("[DEBUG] Succesfully added points")
						});
			    	}
			    	else {
			    		console.log(channel.substring(1) + " is offline")
			    	}
			  	}
			}
			request(info, callback)
		}, function () {}, true );
	}
}
