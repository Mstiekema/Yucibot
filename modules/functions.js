var options = require('../config.js')
var request = require("request");
var clientID = options.identity.clientId
var connect = require('../app.js')
var mysql = require("mysql");
var bot = connect.bot
var cooldowns = [];
var connection;

module.exports = {
  addPoints: function (user, points) {
	  module.exports.connection.query('update user set points = points + "' + points + '" where name = ?', user, function (err, result) {
      if (result.changedRows == 0) {
		    var userInfo = {
			    name: user,
				  points: points,
          num_lines: 0,
				  level: 100
			  }
			  module.exports.connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})
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
