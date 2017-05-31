var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")

module.exports = {
  addQuote: function (channel, user, msg, self, message) {
    if (msg[0] == "!addquote") {
      function addQuote() {
        var quoteInfo = {
          quote: message.substring(10, message.length),
          name: user.username
        }
        func.connection.query('insert into quotes set ?', quoteInfo, function (err, result) {
          bot.whisper(user.username, "Succesfully added your quote with the ID #" + result.insertId)
        })
      }
      func.cooldown("addQuote", "global", user.username, 10, addQuote)
    }
  },
  getQuotes: function(channel, user, msg, self) {
    if (msg[0] == "!quote") {
      function getQuote() {
        func.connection.query('select * from quotes where id = ?', msg[1], function(err, result) {
          if(!result[0]) return bot.say(channel, "There is no quote with the ID #" + msg[1])
          bot.say(channel, '#' + result[0].id + ' " ' + result[0].quote + ' " - ' + result[0].name)
        })
      }
      func.cooldown("getQuote", "global", user.username, 10, getQuote)
    }
    if (msg[0] == "!randomquote") {
      function randomQuote() {
        func.connection.query('select * from quotes', function(err, result) {
          var j = result.length
          var i = Math.floor(Math.random() * j)
          bot.say(channel, '#' + result[i].id + ' " ' + result[i].quote + ' " - ' + result[i].name)
        })
      }
      func.cooldown("randomQuote", "global", user.username, 10, randomQuote)    
    }
    if (msg[0] == "!delquote" && (user.mod == true || user.username == channel.substring(1))) {
      func.connection.query('delete from quotes where id = ?', msg[1], function(err, result) {
        bot.whisper(user.username, 'Succesfully removed the quote with ID #' + msg[1])
      })
    }
  }
}