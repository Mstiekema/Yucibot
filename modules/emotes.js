var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")

module.exports = {
	track: function (channel, user, message, self, msg) {
		if(user.emotes) {
			var emotes = user.emotes
			for (key in emotes) {
				for(var i = 0; i < emotes[key].length; i++) {
					getEmoteId(emotes, key, msg, i)
				}
			}
			function getEmoteId(emotes, key, msg, i) {
				var loc = emotes[key][i].split("-")
				var addToEmoteDatabase = {
					emoteId: key,
					name: msg.substring(loc[0], (parseInt(loc[1]) + 1)),
					type: 'twitch',
					url: 'https://static-cdn.jtvnw.net/emoticons/v1/'+key+'/3.0'
				}
				var addEmoteStat = {
					id: key,
					name: msg.substring(loc[0], (parseInt(loc[1]) + 1)),
					type: 'twitch'
				}
				func.connection.query('select * from emotes where type = "twitch" AND emoteId = ?', key, function(err, result) {
					if (!result[0]) {
						func.connection.query('insert into emotes set ?', addToEmoteDatabase, function(err, result) {if (err) {return}})
					}
					func.connection.query('select * from emotestats where id = ?', key, function(err, result) {
						if (result[0] == undefined) {
							func.connection.query('insert into emotestats set ?', addEmoteStat, function (err, result) {if (err) {return}})
						} else {
							func.connection.query('update emotestats set uses = uses + 1 where id = ?', key, function (err, result) {if (err) {return}})
						}
					})
				})
			}
			var emote = user.emotes
		}
		func.connection.query('select * from emotes where type != "twitch"', function(err, result) {
			var mesg = msg.split(" ")
			for (msg in mesg) {
				for (emote in result) {
					if(result[emote].name == mesg[msg]) {
						addToEmoteStats(result, emote)
					}
				}
			}
			function addToEmoteStats(result, emote) {
				var addEmoteStat = {
					id: result[emote].emoteId,
					name: result[emote].name,
					type: result[emote].type
				}
				func.connection.query('select * from emotestats where id = ?', addEmoteStat.id, function(err, result) {
					if (result[0] == undefined) {
						func.connection.query('insert into emotestats set ?', addEmoteStat, function (err, result) {if (err) {return}})
					} else {
						func.connection.query('update emotestats set uses = uses + 1 where id = ?', addEmoteStat.id, function (err, result) {if (err) {return}})
					}
				})
			}
		})
  },
	getStats: function(channel, user, message, self) {
		if (message[0] == "!topemotes") {
			function getTopEmotes() {
				func.connection.query('SELECT * FROM emotestats INNER JOIN emotes ON emotestats.id = emotes.emoteId ORDER BY emotestats.uses DESC LIMIT 5', function (err, result) {
					bot.say(channel, "Top 5 Twitch emotes: " +
					"1. " + result[0].name + "  " + result[0].uses + "x | " +
					"2. " + result[1].name + "  " + result[1].uses + "x | " +
					"3. " + result[2].name + "  " + result[2].uses + "x | " +
					"4. " + result[3].name + "  " + result[3].uses + "x | " +
					"5. " + result[4].name + "  " + result[4].uses + "x")
				})
			}
			func.cooldown("getTopEmotes", global, user.username, 60, getTopEmotes)
		}
		if (message[0] == "!usage") {
			function getEmoteUsage() {
				func.connection.query('SELECT * FROM emotestats INNER JOIN emotes ON emotestats.id = emotes.emoteId WHERE emotestats.name = ?', message[1], function (err, result) {
					if (!result || !result[0]) return
					bot.say(channel, "The emote " + result[0].name + " has been used " + result[0].uses + " times." )
				})
			}
			func.cooldown("getEmoteUsage", global, user.username, 10, getEmoteUsage)
		}
	}
 }
