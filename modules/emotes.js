var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")

module.exports = {
	track: function (channel, user, message, self) {
    if (user.emotes == null) return
		Object.keys(user.emotes).forEach(function(emote) {
      func.connection.query('select * from emotestats where id = ?', emote, function(err, result) {
        if (result[0] == undefined) {
          func.connection.query('insert into emotestats set id = ?', emote, function (err, result) {if (err) {return}})
        } else {
          func.connection.query('update emotestats set uses = uses + 1 where id = ?', emote, function (err, result) {if (err) {return}})
        }
		 	})
    })
  },
	getStats: function(channel, user, message, self) {
		if (message.startsWith("!topemotes")) {
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
	}
 }
