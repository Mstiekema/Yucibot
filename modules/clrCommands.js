var io = require('socket.io')(2345);
var options = require('../config.js')
var connection = require("./connection.js")
var request = require("request");
var connect = require('../app.js')
var func = require("./functions.js")
var bot = connect.bot

module.exports = {
  clrComm: function(channel, user, message, self) {
    var msg = message.split(" ")
    if(msg[0] != ("!clr")) return
    if(msg[1] == "msg") {
      function clr() {
        io.emit('message', { "message": message.substring(8), "user": user['display-name'] });
        bot.whisper(user.username, "Succesfully showed your message " + message.substring(8));
      }
      // func.remPoints(user.username, 1000, clr, "CLR message")
      func.pointCd("CLR_Message", global, user.username, 10, clr, 1000)
    }
    if (msg[1] == "emote") {
      connection.query('select * from emotes WHERE name = ?', msg[2], function(err, result) {
        if(result[0] == undefined) return
        var url = result[0].url
        function clr() {io.emit('emote', { "url": url }); bot.whisper(user.username, "Succesfully showed your emote " + msg[2]);}
        // func.remPoints(user.username, 1000, clr, "CLR emote")
        func.pointCd("CLR_Emote", global, user.username, 10, clr, 1000)
      })
    }
    if (msg[1] == "sound") {
      var sounds = ["echo", "datboi", "fuckyou", "lielielie", "bottle", "beer"]
      if (sounds.indexOf(msg[2]) == -1) return bot.whisper(user.username, "This is not a valid sound. Please try again.");
      function clr() {io.emit('sound', { "sound": msg[2] }); bot.whisper(user.username, "Succesfully played your sound " + msg[2]);}
      // func.remPoints(user.username, 1000, clr, "CLR sound")
      func.pointCd("CLR_Sound", global, user.username, 10, clr, 1000)
    }
  }
}
