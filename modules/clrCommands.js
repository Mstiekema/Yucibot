var io = require('socket.io')(2345);
var options = require('../config.js')
var request = require("request");
var connect = require('../app.js')
var func = require("./functions.js")
var bot = connect.bot

module.exports = {
  clrComm: function(channel, user, message, self) {
    if(message[0] != ("!clr")) return
    if(message[1] == "message") {
      function clrM() {
        io.emit('message', { "message": message.join(" ").substring(12), "user": user['display-name'] });
        bot.whisper(user.username, "Succesfully showed your message " + message.substring(8));
      }
      func.pointCd("CLR_Message", global, user.username, 10, clrM, 1000)
    }
    if (message[1] == "emote") {
      func.connection.query('select * from emotes WHERE name = ?', message[2], function(err, result) {
        if(result[0] == undefined) return
        var url = result[0].url
        function clrE() {io.emit('emote', { "url": url, "emote": message[2] }); bot.whisper(user.username, "Succesfully showed your emote " + message[2]);}
        func.pointCd("CLR_Emote", global, user.username, 10, clrE, 1000)
      })
    }
    if (message[1] == "sound") {
      var sounds = ["echo", "datboi", "fuckyou", "bottle", "beer", "zelda", "harro", "bedankt"]
      if (sounds.indexOf(message[2]) == -1) return bot.whisper(user.username, "This is not a valid sound. Please try again.");
      function clrS() {io.emit('sound', { "sound": message[2] }); bot.whisper(user.username, "Succesfully played your sound " + message[2]);}
      func.pointCd("CLR_Sound", global, user.username, 10, clrS, 1000)
    }
    if (message[1] == "gif") {
      var sounds = ["pepe", "billy", "kappa"]
      if (sounds.indexOf(message[2]) == -1) return bot.whisper(user.username, "This is not a valid gif. Please try again.");
      function clrG() {io.emit('gif', { "gif": message[2] }); bot.whisper(user.username, "Succesfully showed your gif " + message[2]);}
      func.pointCd("CLR_GIF", global, user.username, 10, clrG, 1000)
    }
  },
  emotes: function (channel, user, message, self) {
    if (user.emotes == null) return
    Object.keys(user.emotes).forEach(function(emote) {
      func.connection.query('select * from emotes where emoteId = ? AND type = "twitch"', emote, function(err, result) {
        if(result[0] == undefined) return
        var link = result[0].url
        io.emit('chatEmote', {"url": link});
      })
    })
  },
}
