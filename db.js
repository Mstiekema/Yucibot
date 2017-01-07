var options		= require('./config.js')
var connection 	= require('./modules/connection.js')









// Put into file
var userInfo = {
	name: 'mstiekema',
	points: 0,
	num_lines: 0,
	level: 100,
	isSub: false,
	isMod: false
}
connection.query('insert into user set ?', userInfo, function (err, result) {if (err) {return}})



// Updater
var name = "xd"
connection.query('update user set points = points + 1 where name = ?', name, function (err, result) {if (err) {return}})



// Get info
var name = "mstiekema"
connection.query('select * from user where name = ?', name, function(err, result) {if (err) {return}})











connection.end();