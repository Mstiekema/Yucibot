var options = require('../config.js')
var io = require('socket.io')(options.identity.port + 1);
var request = require("request");
var connect = require('../app.js')
var func = require("./functions.js")
var bot = connect.bot

module.exports = {
  clrComm: function(channel, user, message, self, msg) {
    func.connection.query('select * from modulesettings where moduleType = "clrComm"', function(err, result) {
      if(message[0] != ("!clr")) return
      var cost = result[0].value
      var cd = result[1].value
      if(message[1] == "message") {
        function clrM() {
          io.emit('message', { "message": message.join(" ").substring(12), "user": user['display-name'] });
          bot.whisper(user.username, "Succesfully showed your message " + message.join(" ").substring(8));
        }
        func.pointCd("CLR_Message", global, user.username, cd, clrM, cost)
      }
      if (message[1] == "emote") {
        var emote = msg.split(" ")
        func.connection.query('select * from emotes WHERE name = ?', emote[2], function(err, result) {
          if(result[0] == undefined) return
          var url = result[0].url
          function clrE() {io.emit('emote', { "url": url, "emote": message[2] }); bot.whisper(user.username, "Succesfully showed your emote " + message[2]);}
          func.pointCd("CLR_Emote", global, user.username, cd, clrE, cost)
        })
      }
      if (message[1] == "sound") {
        func.connection.query('select * from clr where type = "sound"', function(err, result) {
          var sounds = new Array;
          for (var i = 0; i < result.length; i++) {
            sounds.push(result[i].name)
          }
          if (sounds.indexOf(message[2]) == -1) {
            return bot.whisper(user.username, "This is not a valid sound. Please try again.");
          } else {
            var i = sounds.indexOf(message[2])
            var url = result[i].url
            console.log(url)
            function clrS() {io.emit('sound', {"sound": message[2], url: url}); bot.whisper(user.username, "Succesfully played your sound " + message[2]);}
            func.pointCd("CLR_Sound", global, user.username, cd, clrS, cost)  
          }
        })
      }
      if (message[1] == "gif") {
        func.connection.query('select * from clr where type = "gif"', function(err, result) {
          var gifs = new Array;
          for (var i = 0; i < result.length; i++) {
            gifs.push(result[i].name)
          }
          if (gifs.indexOf(message[2]) == -1) {
            return bot.whisper(user.username, "This is not a valid gif. Please try again.");
          } else {
            var i = gifs.indexOf(message[2])
            var url = result[i].url
            function clrG() {io.emit('gif', {gif: message[2], url: url}); bot.whisper(user.username, "Succesfully showed your gif " + message[2]);}
            func.pointCd("CLR_GIF", global, user.username, cd, clrG, cost)  
          }
        })
      }
      if (message[1] == "meme") {
        func.connection.query('select * from clr where type = "meme"', function(err,result){
          var length = result.length
          var ranN = Math.floor(Math.random() * length)
          if(user.mod == true || user.username == channel.substring(1)) {
            function clrM() {io.emit('meme', {"meme": result[ranN].url}); bot.whisper(user.username, "Succesfully played a random meme");}
            func.pointCd("CLR_Meme", user, user.username, 1, clrM, 0) 
          } else {
            function clrM() {io.emit('meme', {"meme": result[ranN].url}); bot.whisper(user.username, "Succesfully played a random meme");}
            func.pointCd("CLR_Meme", global, user.username, cd, clrM, cost * 2)  
          }
        })
      }
    })
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
