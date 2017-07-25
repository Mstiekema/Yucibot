var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")
var allowedUsers = [];

module.exports = {
	mod: function (channel, user, message, self) {
		if (message[0] == "!emoteupdate") { if (user.mod === true || user.username == channel.substring(1)) {
			func.updateEmotes(channel.substring(1));
		}}
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
	link: function(channel, user, msg, self) {
		var message = msg.join(" ")
		func.connection.query('select * from modulesettings where moduleType = "linkMod"', function(err, result) {
			var cd = result[1].value
			var link = String(message).match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm)
			if(link != null) {
				if (user.mod == false) { if (user.username != channel.substring(1)) { if(user.username.indexOf(allowedUsers) == -1 || allowedUsers[0] == undefined) {
					if (result[0].value == 1) {
						if (user.subscriber != true) { bot.timeout(channel, user.username, cd, "Non-subs are not allowed to post links") }
					} else {
						bot.timeout(channel, user.username, cd, "You are not allowed to post links")
					}
				}}}
			}
		})

		function addToPermit(permUser) {
			allowedUsers.push(permUser)
			setTimeout(function() {
				var index = allowedUsers.indexOf(permUser);
				allowedUsers.splice(index, 1);
			}, 30000);
		}

		if (user.mod || user.username == channel.substring(1)) { if(msg[0] == "!permit") {
			var permUser = msg[1]
			addToPermit(permUser)
			bot.say(channel, permUser + " can now post links for the next 30 seconds.")
		}}
	},
	commandManagement: function(channel, user, message, self) {
		if (user.mod || user.username == channel.substring(1)) {
			if(message[0] == ("!addcommand")) {
				var commName = message[1]
				message.splice(0, 2)
				var commInfo = {
					commName: commName,
					response: message.join(" "),
					cdType: "global",
					cd: 10,
				}
				func.connection.query('insert into commands set ?', commInfo, function (err, result) {if (err) {return}})
				bot.whisper(user.username, "Succesfully added the new command " + commName)
			}
			if(message[0] == ("!editcommand")) {
				var commName = message[1]
				message.splice(0, 2)
				func.connection.query('update commands set response = "' + message.join(" ") + '" where commName = ?', commName, function (err, result) {
					if (result.changedRows == 0) {
						bot.whisper(user.username, "Something went wrong while editing " + commName)
					} else {
						bot.whisper(user.username, "Succesfully edited " + commName)
					}
				})
			}
			if(message[0] == "!removecommand") {
				var commName = message[1]
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
