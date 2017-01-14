var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var ytApiKey 	= options.identity.ytApiKey
var request 	= require("request");
var connection 	= require("./connection.js")

module.exports = {
	getSongs: function () {
		bot.on('message', function (channel, user, message, self) {
			if (message.startsWith("!sr") || message.startsWith("!songrequest")) {
				songlink = message.split(" ")
				var id = songlink[1]
				var match = String(songlink).match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
				if(match != null || id.length == 11) {
					var url = "https://www.googleapis.com/youtube/v3/videos?id=" + id + "&key=" + ytApiKey + "%20&part=snippet,contentDetails,statistics,status"
					request(url, function (error, response, body) {
						info = JSON.parse(body)
						if (info.items[0] == null) {
							bot.whisper(user.username, "This is not a valid YT video :/")
							return
						}
						base = info.items[0]
						var length = base.contentDetails.duration
						var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
						var hours = 0, minutes = 0, seconds = 0, totalseconds;
					  	var matches = reptms.exec(length);
						if (matches[1]) hours = Number(matches[1]);
						if (matches[2]) minutes = Number(matches[2]);
					    if (matches[3]) seconds = Number(matches[3]);
					    totalseconds = Number(hours * 3600  + minutes * 60 + seconds);
						var title = base.snippet.title
						var srInfo = {
							title: base.snippet.title,
							thumb: base.snippet.thumbnails.default.url,
							name: user.username,
							length: totalseconds,
							songid: id
						}
						var getTime = new Date();
						connection.query('select * from songrequest where DATE_FORMAT(time,"%Y-%m-%d") = DATE_FORMAT(NOW(),"%Y-%m-%d")', function(err, result) {
							var songNames = result.map(function(a) {return a.title;})
							if (songNames.indexOf(title) == -1) {
								connection.query('insert into songrequest set ?', srInfo, function (err, result) {if (err) {return}})
								bot.whisper(user.username, "Succesfully added your song to the queue!")
							} else {
								bot.whisper(user.username, "This song has already been requested :/")
							}
						})
					}
				)}
			}
		});
	}
}