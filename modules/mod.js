var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")

module.exports = {
	mod: function (channel, user, message, self) {
		if (message.startsWith("1quit")) {
			if (user.mod === true || user.username == channel.substring(1)) {
				bot.say(channel, "Shutting down Yucibot MrDestructoid")
				bot.disconnect()
				process.exit(1)
			}
			else {
				bot.say(channel, "You are not allowed to turn off the bot OMGScoots")
			};
		}
		 var message = message.toLowerCase()
		 if (user.mod == false) { if (user.username != channel.substring(1)) { if (user.subscriber != true) {
		 	func.connection.query('select * from timeout where type = "purge"', function(err, result) {
		 		var purge = result.map(function(a) {return a.word;})
				if (new RegExp(purge.join("|")).test(message) && purge[0]) {
	   			bot.timeout(channel, user.username, 10, "Used a banned word")
				}
		 	})
		 	func.connection.query('select * from timeout where type = "timeout"', function(err, result) {
		 		var timeout = result.map(function(a) {return a.word;})
				if (new RegExp(timeout.join("|")).test(message) && timeout[0]) {
	   			bot.timeout(channel, user.username, 600, "Used a banned word")
				}
		 	})
		 	func.connection.query('select * from timeout where type = "ban"', function(err, result) {
		 		var ban = result.map(function(a) {return a.word;})
		 		if (new RegExp(ban.join("|")).test(message) && ban[0]) {
	   			bot.ban(channel, user.username, "Used a banned word");
				}
		 	})
		 }}}
		if (user.mod || user.username == channel.substring(1)) {
			var message = message.split(" ");
			if (message.length == 2) {
				if (message[0] == "!addpurge") {
					var newWord = {word: message[1], type: "purge"}
					func.connection.query('insert into timeout set ?', newWord, function (err, result) {if (err) {return}})
					bot.whisper(user.username, "Succesfully added a new purge word: " + message[1])
				}
				if (message[0] == "!addtimeout") {
					var newWord = {word: message[1], type: "timeout"}
					func.connection.query('insert into timeout set ?', newWord, function (err, result) {if (err) {return}})
					bot.whisper(user.username, "Succesfully added a new timeout word: " + message[1])
				}
				if (message[0] == "!addban") {
					var newWord = {word: message[1], type: "ban"}
					func.connection.query('insert into timeout set ?', newWord, function (err, result) {if (err) {return}})
					bot.whisper(user.username, "Succesfully added a new bam word: " + message[1])
				}
			}
		}
	},
	link: function(channel, user, message, self) {
		var link = String(message).match(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/igm)
		if(link != null) { if (user.mod == false) { if (user.username != channel.substring(1)) { if (user.subscriber != true) {
			bot.timeout(channel, user.username, 20, "Non-subs are not allowed to post links")
		}}}}
	},
	commandManagement: function(channel, user, message, self) {
		if (user.mod || user.username == channel.substring(1)) {
			if(message.startsWith("!addcommand")) {
				var info = message.split(" ")
				var commName = info[1]
				info.splice(0, 2)
				var commInfo = {
					commName: commName,
					response: info.join(" "),
					cdType: "global",
					cd: 10,
				}
				func.connection.query('insert into commands set ?', commInfo, function (err, result) {if (err) {return}})
				bot.whisper(user.username, "Succesfully added the new command " + commName)
			}
			if(message.startsWith("!removecommand")) {
				var info = message.split(" ")
				var commName = info[1]
				func.connection.query('delete from commands where commName = ?', commName, function (err, result) {
					if (err) {
						bot.whisper(user.username, "Couldn't find the command you were looking for")
					} else {
						bot.whisper(user.username, "Succesfully removed the following command: " + commName)
					}
				})
			}
		}
	}
}
