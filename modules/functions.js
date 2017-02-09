var options = require('../config.js')
var request = require("request");
var clientID = options.identity.clientId
var connection = require("./connection.js")

module.exports = {
  addPoints: function (user, points) {
	  connection.query('update user set points = points + "' + points + '" where name = ?', user, function (err, result) {
      if (result.changedRows == 0) {
		    var userInfo = {
			    name: user,
				  points: points,
          num_lines: 0,
				  level: 100
			  }
			  connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})
      }
    })
  }
}
