var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var request 	= require("request");
var fs 			= require('fs');
var connection 	= require("./connection.js")

module.exports = {
	mod: function () {
		bot.on("message", function (channel, user, message, self) {
		    var message = message.toLowerCase()
		    if (user.mod == false) { if (user.username != channel.substring(1)) { if (user.sub == false || user.sub == undefined) {
		    	connection.query('select * from timeout where type = "purge"', function(err, result) {
		    		var purge = result.map(function(a) {return a.word;})
					if (new RegExp(purge.join("|")).test(message) && purge[0]) {
	    				bot.timeout(channel, user.username, 10, "Used a banned word")
					}
		    	})
		    	connection.query('select * from timeout where type = "timeout"', function(err, result) {
		    		var timeout = result.map(function(a) {return a.word;})
					if (new RegExp(timeout.join("|")).test(message) && timeout[0]) {
	    				bot.timeout(channel, user.username, 600, "Used a banned word")
					}
		    	})
		    	connection.query('select * from timeout where type = "ban"', function(err, result) {
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
						connection.query('insert into timeout set ?', newWord, function (err, result) {if (err) {return}})
						bot.whisper(user.username, "Succesfully added a new purge word: " + message[1])
					}
					if (message[0] == "!addtimeout") {
						var newWord = {word: message[1], type: "timeout"}
						connection.query('insert into timeout set ?', newWord, function (err, result) {if (err) {return}})
						bot.whisper(user.username, "Succesfully added a new timeout word: " + message[1])
					}
					if (message[0] == "!addban") {
						var newWord = {word: message[1], type: "ban"}
						connection.query('insert into timeout set ?', newWord, function (err, result) {if (err) {return}})
						bot.whisper(user.username, "Succesfully added a new bam word: " + message[1])
					}
				}
			}
		});
	}
}