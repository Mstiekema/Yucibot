var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var fs 			= require('fs');
var Bottleneck 	= require("bottleneck");
var CronJob 	= require('cron').CronJob;
var request 	= require("request");
var mkdirp 		= require('mkdirp');

module.exports = {

	updateProfile: function () {

		bot.on('message', function (channel, user, message, self) {
			var file = './static/user/_' + user.username + '/logs.json'
			var profFile = './static/user/_' + user.username + '/profile.json'
			var time = new Date();
			var day = time.getDate();
			var month = time.getMonth();
			var year = time.getFullYear();
			var hours = time.getHours();
			var minutes = time.getMinutes();
			var seconds = time.getSeconds();
			var logDate = day + '-' + month + '-' + year
			var logTime = hours + ':' + minutes + ':' + seconds
			var log = '{"date": "' + logDate + '", "time": "' + logTime + '", "chatter": "' + user.username + '", "message": "' + message  +'"}]}'
			var logNew = '{"messages": [ \n' + log
			var profNew = '{\n "profile": {\n "points": 0,\n "lines": 0\n }\n}'

			if (fs.existsSync(file || profFile)) {
				addLine = function() {
					linesGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
					linesGet.profile.lines = linesGet.profile.lines + 1
					fs.writeFile(profFile, JSON.stringify(linesGet, null, 2))
				}
				setTimeout(addLine, 100)

				fs.readFile(file, 'utf8', function(err, data) {if (err) {return}
			   		var result = data.replace("]}", ",\n");
			   		fs.writeFile(file, result, 'utf8', function(err) {
			   		    if (err) {
			   		       return
			   		    }
			   		})
				});
				var message = message.replace(/[`\'",.<>\{\}\[\]\\\/]/gi, '')
				fs.appendFileSync(file, '{"date": "' + logDate + '", "time": "' + logTime + '", "chatter": "' + user.username + '", "message": "' + message  +'"}]}');
			}
			else {
				mkdirp('./static/user/_' + user.username, function(err) {}); 
				fs.writeFileSync(profFile, profNew)
				mkdirp('./static/user/_' + user.username, function(err) {}); 
				fs.appendFileSync(file, logNew)
			}
		});
	},

	fetchProfile: function() {

		var rqCd = new Bottleneck(0, 5000, 0);
		var lineCd = new Bottleneck(0, 5000, 0);
		var pointCd = new Bottleneck(0, 5000, 0);

		bot.on('message', function (channel, user, message, self) {

			function toAdminLog(toLog) {
				var time = new Date(); 
				var day = time.getDate(); 
				var month = time.getMonth(); 
				var year = time.getFullYear();
				var hours = time.getHours(); 
				var minutes = time.getMinutes(); 
				var seconds = time.getSeconds();
				var logTime = "[" + day + '-' + month + '-' + year + " / " + hours + ':' + minutes + ':' + seconds + "] "
				var toLog = logTime + user.username + toLog
				getLog = JSON.parse(fs.readFileSync('./static/json/logs.json', 'utf8'))
				getLog.points.push(toLog)
				newLog = JSON.stringify(getLog)
				fs.writeFileSync('./static/json/logs.json', newLog)
			}

			if (message.startsWith("!rq")) {
				function giveRQ() {
					var obj = JSON.parse(fs.readFileSync('./static/user/_' + user.username + '/logs.json', 'utf8'));
					var count = Object.keys(obj.messages).length;
					var i = Math.floor(Math.random() * count);
					bot.say(channel, obj.messages[i].chatter + ': ' + obj.messages[i].message)
				}
				function doComm() {rqCd.submit(giveRQ)}
				setTimeout(doComm, 100)
			};

			var pointStoreFile = './static/user/_' + user.username + '/profile.json';
			if (message.startsWith("!lines")) {
				function giveLines() {
					if (fs.existsSync(pointStoreFile)) {
						pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
						bot.whisper(user.username, "You have written " + pointsGet.profile.lines + " lines in this chat!")
					}
				}
				lineCd.submit(giveLines)
			}
			if (message.startsWith("!addpoints")) {
				if (fs.existsSync(pointStoreFile) && (user.mod === true || user.username == channel.substring(1))) {
					var pointStoreFile = './static/user/_' + user.username + '/profile.json';
					pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
					pointsGet.profile.points = pointsGet.profile.points + 1000
					fs.writeFile(pointStoreFile, JSON.stringify(pointsGet, null, 2))
					bot.whisper(user.username, "Added 1000 points", message.substring(message.indexOf(" ")))
					var toLog = ' got 1000 points with !addpoints.'
					toAdminLog(toLog);
				}
			}
			if(message.startsWith("!points")) {
				if (fs.existsSync(pointStoreFile)) {
					var pointStoreFile = './static/user/_' + user.username + '/profile.json';
					pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
					bot.whisper(user.username, "You have " + pointsGet.profile.points + " points!")
				}
			}
		});
	}
}