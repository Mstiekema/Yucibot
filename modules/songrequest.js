var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var ytApiKey 	= options.identity.ytApiKey
var request 	= require("request");
var fs 			= require('fs');

module.exports = {
	getSR: function () {
		bot.on('message', function (channel, user, message, self) {
			if (message.startsWith("!sr")) {
				var time = new Date();
				var day = time.getDate();
				var month = time.getMonth() + 1;
				var year = time.getFullYear();
				var file = './static/json/songlists/songlist' + year + "-" + month + "-" + day + ".json";
				songlink = message.split(" ")
				var match = String(songlink).match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
				if(match != null) {
					id = match[1]
					var url = "https://www.googleapis.com/youtube/v3/videos?id=" + id + "&key=" + ytApiKey + "%20&part=snippet,contentDetails,statistics,status"
					request(url, function (error, response, body) {
						info = JSON.parse(body)
						if (info.items[0] == null) {
							bot.whisper(user.username, "This is not a valid YT video :/")
							return
						}
						base = info.items[0]
						title = base.snippet.title
						thumb = base.snippet.thumbnails.default.url
						user = user.username
						// length = base.contentDetails.duration
						function newLine () {
							var newLine = ['{"name": "' + title + '", "user": "' + user + '", "id": "' + id + '", "img": "' + thumb + '"}]']
							fs.appendFileSync(file, newLine)
						}
						if (fs.existsSync(file)) {
							fs.readFile(file, 'utf8', function(err, data) {if (err) {return}
								if (data.includes(title)) {
									bot.whisper(user, "This song has already been requested :/")
								} else {
									var replace = data.replace("}]", "},\n");
		   							fs.writeFile(file, replace)
		   							setTimeout(newLine, 10)
		   							bot.whisper(user, "Succesfully added your song to the queue! :D")
		   						}
							});
						}
						else {
							fs.writeFileSync(file, '[')
							setTimeout(newLine, 10)
							bot.whisper(user, "Succesfully added your song to the queue! :D")
						}
					}
				)}
				else {
					bot.whisper(user.username, "That's not a valid YT video :/")				
				}
			}
		});
	}
}