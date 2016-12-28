var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var fs 			= require('fs');
var wordList 	= './static/json/words.json'

module.exports = {
	mod: function () {
		bot.on("message", function (channel, user, message, self) {
		    var message = message.toLowerCase()

		    if (user.mod == false) { if (user.username != channel.substring(1)) { if (user.sub == false) {
			    var purge = JSON.parse(fs.readFileSync(wordList, 'utf8')).purge
				if (new RegExp(purge.join("|")).test(message)) {
	    			bot.timeout(channel, user.username, 10, "Used a banned word")
				}
			    var timeout = JSON.parse(fs.readFileSync(wordList, 'utf8')).timeout
				if (new RegExp(timeout.join("|")).test(message)) {
	    			bot.timeout(channel, user.username, 600, "Used a banned word")
				}
			    var ban = JSON.parse(fs.readFileSync(wordList, 'utf8')).ban
				if (new RegExp(ban.join("|")).test(message)) {
	    			bot.ban(channel, user.username, "Used a banned word");
				}
			}}}

			if (user.mod || user.username == channel.substring(1)) {
				if (message.startsWith("!addpurge")) {
					var message = message.split(" ");
					var word = message[1]
					getWords = JSON.parse(fs.readFileSync(wordList, 'utf8'))
					getWords.purge.push(word)
					newBan = JSON.stringify(getWords)
					fs.writeFileSync(wordList, newBan)
					return
				}
				if (message.startsWith("!addtimeout")) {
					var message = message.split(" ");
					var word = message[1]
					getWords = JSON.parse(fs.readFileSync(wordList, 'utf8'))
					getWords.timeout.push(word)
					newBan = JSON.stringify(getWords)
					fs.writeFileSync(wordList, newBan)
					return
				}
				if (message.startsWith("!addban")) {
					var message = message.split(" ");
					var word = message[1]
					getWords = JSON.parse(fs.readFileSync(wordList, 'utf8'))
					getWords.ban.push(word)
					newBan = JSON.stringify(getWords)
					fs.writeFileSync(wordList, newBan)
					return
				}
			}
		});
	},
	logs: function() {
		var logFile = "./static/json/logs.json"
		var time = new Date(); 
		var day = time.getDate(); 
		var month = time.getMonth(); 
		var year = time.getFullYear();
		var hours = time.getHours(); 
		var minutes = time.getMinutes(); 
		var seconds = time.getSeconds();
		var logTime = "[" + day + '-' + month + '-' + year + " / " + hours + ':' + minutes + ':' + seconds + "] "
		
		bot.on("ban", function (channel, username, reason) {
    		var message = logTime + "[BAN] " + username + " has been banned. Reason: " + reason
    		getBans = JSON.parse(fs.readFileSync(logFile, 'utf8'))
			getBans.timeout.push(message)
			newBan = JSON.stringify(getBans)
			fs.writeFileSync(logFile, newBan)
		});
			
		bot.on("timeout", function (channel, username, reason, duration) {
    		var message = logTime + "[TIMEOUT] " + username + " has been timed out for " + duration + " minutes. Reason: " + reason
    		getBans = JSON.parse(fs.readFileSync(logFile, 'utf8'))
			getBans.timeout.push(message)
			newBan = JSON.stringify(getBans)
			fs.writeFileSync(logFile, newBan)
		});
	}
}