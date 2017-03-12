var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")

module.exports = {
	track: function (channel, user, message, self) {
    if (user.emotes == null) return
    for(var i = 0; i < Object.keys(user.emotes).length; i++) {
      var emote = Object.keys(user.emotes)[i]
      func.connection.query('select * from emotestats where id = ?', emote, function(err, result) {
        if (result[0] == undefined) {
          func.connection.query('insert into emotestats set id = ?', emote, function (err, result) {if (err) {return}})
        } else {
          func.connection.query('update emotestats set uses = uses + 1 where id = ?', emote, function (err, result) {if (err) {return}})
        }
		 	})
    }
  }
}
