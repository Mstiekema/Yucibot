var options = require('../config.js')
var request = require("request");
var clientID = options.identity.clientId
var connect = require('../app.js')
var mysql = require("mysql");
var bot = connect.bot
var cooldowns = [];
var connection;

module.exports = {
  addPoints: function (id, points, user) {
	  module.exports.connection.query('update user set points = points + "' + points + '" where userId = ?', id, function (err, result) {
      if (result.changedRows == 0) {
		    var userInfo = {
			    name: user,
          userId: id,
				  points: points,
          num_lines: 0,
				  level: 100
			  }
			  module.exports.connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})
        module.exports.connection.query('insert into userstats set userId = ?', id, function (err, result) {if (err) {return}})
      }
    })
  },
  remPoints: function (user, remPoints, func, funcName) {
    module.exports.connection.query('select * from user where name = ?', user, function (err, result) {
      if (result[0] != undefined) {
        if(result[0].points >= remPoints) {
          func()
          module.exports.connection.query('update user set points = points - "' + remPoints + '" where name = ?', user, function (err, result) {})
          var newLog = {type: "points", log: user + " used " + remPoints + " for the " + funcName + " command."}
          module.exports.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
        } else {
          bot.whisper(user, "You do not have enough points to use this command.")
        }
      } else {
        return false
      }
    })
  },
  addStats: function (id, type, result, profit) {
    var upRes = type + result
	  module.exports.connection.query('update userstats set '+upRes+' = '+upRes+' + 1, '+type+'Profit = '+type+'Profit + '+profit+' where userId = ?', id, function (err, result) {
      if (result.changedRows == 0) {
        module.exports.connection.query('insert into userstats set userId = ?', id, function (err, result) {
          module.exports.connection.query('update userstats set '+upRes+' = '+upRes+' + 1, '+type+'Profit = '+type+'Profit + '+profit+' where userId = ?', id, function (err, result) {if (err) {return}})
        })
      }
    })
  },
  addXP: function (id, xp, user) {
    module.exports.connection.query('update user set xp = xp + "' + xp + '" where userId = ?', id, function (err, result) {if (err) {return}})
  },
  addTime: function (id, minutes, user, state) {
    if (state == "online") {
      module.exports.connection.query('update user set timeOnline = timeOnline + "' + minutes + '" where userId = ?', id, function (err, result) {if (err) {return}})
    } else {
      module.exports.connection.query('update user set timeOffline = timeOffline + "' + minutes + '" where userId = ?', id, function (err, result) {if (err) {return}})
    }
  },
  cooldown: function(command, cdtype, user, cooldown, exc) {
    var toCD = user + command
    var cd = cooldown * 1000
    if(cdtype == "user") {
      if (cooldowns.indexOf(command) != -1) {
        return
      } else {
        if (cooldowns.indexOf(toCD) != -1) {
          return
        } else {
          cooldowns.push(toCD)
          cooldowns.push(command)
          setTimeout(function() {
            var index = cooldowns.indexOf(toCD);
            cooldowns.splice(index, 1);
          }, cd);
          setTimeout(function() {
            var index = cooldowns.indexOf(command);
            cooldowns.splice(index, 1);
          }, 10000);
          exc()
        }
      }
    } else {
      if (cooldowns.indexOf(command) != -1) {
        return
      } else {
        cooldowns.push(command)
        setTimeout(function() {
          var index = cooldowns.indexOf(command);
          cooldowns.splice(index, 1);
        }, cd);
        exc()
      }
    }
  },
  pointCd: function(command, cdtype, user, cooldown, exc, points) {
    var toCD = user + command
    var cd = cooldown * 1000
    if(cdtype == "user") {
      if (cooldowns.indexOf(command) != -1) {
        return
      } else {
        if (cooldowns.indexOf(toCD) != -1) {
          return
        } else {
          cooldowns.push(toCD)
          cooldowns.push(command)
          setTimeout(function() {
            var index = cooldowns.indexOf(toCD);
            cooldowns.splice(index, 1);
          }, cd);
          setTimeout(function() {
            var index = cooldowns.indexOf(command);
            cooldowns.splice(index, 1);
          }, 10000);
          module.exports.remPoints(user, points, exc, command)
        }
      }
    } else {
      if (cooldowns.indexOf(command) != -1) {
        return
      } else {
        cooldowns.push(command)
        setTimeout(function() {
          var index = cooldowns.indexOf(command);
          cooldowns.splice(index, 1);
        }, cd);
        module.exports.remPoints(user, points, exc, command)
      }
    }
  },
  updateEmotes: function(channel) {
    var sql = "insert into emotes (name, emoteId, type, url) values ?"
    var emotes = new Array;
    module.exports.connection.query('TRUNCATE emotes',  function(err, result) {if (err) {console.log(err)}})

    // Twitch emotes
    request('https://twitchemotes.com/api_cache/v2/global.json', function (error, response, body) {
    	var emoteBase = JSON.parse(body).emotes
    	for(var key in emoteBase) {
    		var emote = key
    		var type = 'twitch'
    		var imgId = emoteBase[key].image_id
    		var url = 'https://static-cdn.jtvnw.net/emoticons/v1/' + imgId + '/3.0'
    		emotes.push([emote, imgId, type, url])
    	}
    });

    // BTTV emotes channel
    request('https://api.betterttv.net/2/channels/' + channel, function (error, response, body) {
    	var emoteBase = JSON.parse(body).emotes
    	for(var key in emoteBase) {
    		var emote = emoteBase[key].code
    		var type = 'bttv'
    		var imgId = emoteBase[key].id
    		var url = 'https://cdn.betterttv.net/emote/' + imgId + '/3x'
    		emotes.push([emote, imgId, type, url])
    	}
    });

    // FFZ emotes channel
    request('http://api.frankerfacez.com/v1/room/' + channel, function (error, response, body) {
    	var base = JSON.parse(body)
    	if (!base["room"]) return
    	var roomid = base["room"]["_id"]
    	var emoteBase = base["sets"][roomid].emoticons
    	for(var key in emoteBase) {
    		var emote = emoteBase[key].name
    		var type = 'ffz'
    		var imgId = emoteBase[key].id
    		var url = 'https://cdn.frankerfacez.com/emoticon/' + imgId + '/4'
    		emotes.push([emote, imgId, type, url])
    	}
    });

    // BTTV emotes global
    request('https://api.betterttv.net/2/emotes', function (error, response, body) {
    	var emoteBase = JSON.parse(body).emotes
    	for(var key in emoteBase) {
    		var emote = emoteBase[key].code
    		var type = 'bttv'
    		var imgId = emoteBase[key].id
    		var url = 'https://cdn.betterttv.net/emote/' + imgId + '/3x'
    		emotes.push([emote, imgId, type, url])
    	}
    });

    // FFZ emotes global
    request('https://api.frankerfacez.com/v1/set/global', function (error, response, body) {
    	var emoteBase = JSON.parse(body).sets['3'].emoticons
    	for(var key in emoteBase) {
    		var emote = emoteBase[key].name
    		var type = 'ffz'
    		var imgId = emoteBase[key].id
    		var url = 'https://cdn.frankerfacez.com/emoticon/' + imgId + '/4'
    		emotes.push([emote, imgId, type, url])
    	}
    });
    setTimeout(function () { module.exports.connection.query(sql, [emotes], function (err, result) {
      console.log("Updated all emotes")
    })}, 7000);
  },
  command: function(channel, user, message, command, cdtype, cooldown, botSay, remPoints) {
    if (message.startsWith(command)) {
      var toCD = user.username + command
      var cd = cooldown * 1000
      if(cdtype == "user") {
        if (cooldowns.indexOf(command) != -1) {
          return
        } else {
          if (cooldowns.indexOf(toCD) != -1) {
            return
          } else {
            if(remPoints == 0) {
              cooldowns.push(toCD)
              cooldowns.push(command)
              setTimeout(function() {
                var index = cooldowns.indexOf(toCD);
                cooldowns.splice(index, 1);
              }, cd);
              setTimeout(function() {
                var index = cooldowns.indexOf(command);
                cooldowns.splice(index, 1);
              }, 10000);
              bot.say(channel, botSay)
            } else {
              module.exports.connection.query('select * from user where name = ?', user.username, function (err, result) {
                if (result[0] != undefined) {
                  if(result[0].points > remPoints) {
                    cooldowns.push(toCD)
                    cooldowns.push(command)
                    setTimeout(function() {
                      var index = cooldowns.indexOf(toCD);
                      cooldowns.splice(index, 1);
                    }, cd);
                    setTimeout(function() {
                      var index = cooldowns.indexOf(command);
                      cooldowns.splice(index, 1);
                    }, 10000);
                    bot.say(channel, botSay)
                    module.exports.connection.query('update user set points = points - "' + remPoints + '" where name = ?', user.username, function (err, result) {if (err) {console.log(err)}})
                    var newLog = {type: "points", log: user.username + " used " + remPoints + " for the " + command + " command."}
                    module.exports.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
                  } else {
                    bot.whisper(user.username, "You do not have enough points to use this command.")
                  }
                } else {
                  return false
                }
              })
            }
          }
        }
      } else {
        if (cooldowns.indexOf(command) != -1) {
          return
        } else {
          if(remPoints == 0) {
            cooldowns.push(toCD)
            cooldowns.push(command)
            setTimeout(function() {
              var index = cooldowns.indexOf(toCD);
              cooldowns.splice(index, 1);
            }, cd);
            setTimeout(function() {
              var index = cooldowns.indexOf(command);
              cooldowns.splice(index, 1);
            }, 10000);
            bot.say(channel, botSay)
          } else {
            module.exports.connection.query('select * from user where name = ?', user.username, function (err, result) {
              if (result[0] != undefined) {
                if(result[0].points > remPoints) {
                  cooldowns.push(toCD)
                  cooldowns.push(command)
                  setTimeout(function() {
                    var index = cooldowns.indexOf(toCD);
                    cooldowns.splice(index, 1);
                  }, cd);
                  setTimeout(function() {
                    var index = cooldowns.indexOf(command);
                    cooldowns.splice(index, 1);
                  }, 10000);
                  bot.say(channel, botSay)
                  module.exports.connection.query('update user set points = points - "' + remPoints + '" where name = ?', user.username, function (err, result) {if (err) {console.log(err)}})
                  var newLog = {type: "points", log: user.username + " used " + remPoints + " for the " + command + " command."}
                  module.exports.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
                } else {
                  bot.whisper(user.username, "You do not have enough points to use this command.")
                }
              } else {
                return false
              }
            })
          }
        }
      }
    }
  },
  mysqlConn: function() {
    if (!connection) {
      connection = mysql.createConnection({
        host: 'localhost',
        user: options.mysql.user,
        password: options.mysql.password,
        database: options.mysql.database,
        port: 3306
      });
      connection.connect(function(err) {
        if(err) {
          console.log('Database connection error: ', err);
          process.exit(1)
        }
      });
      connection.on('error', function(err) {
        console.log('Database error: ', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
          process.exit(1)
        } else {
          process.exit(1)
          throw err;
        }
      });
    }
    return connection;
  }
}

module.exports.mysqlConn()
module.exports.connection = connection
