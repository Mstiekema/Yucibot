var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")

module.exports = {
	track: function (channel, user, message, self, msg) {
		func.connection.query('select * from emotes', function(err, result) {
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
					console.log(addEmoteStat)
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
				func.connection.query('SELECT * FROM emotestats INNER JOIN emotes ON emotestats.id = emotes.emoteId where emotes.type = "twitch" \
				ORDER BY emotestats.uses DESC LIMIT 5', function (err, result) {
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
	}
 }
