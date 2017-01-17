var connection 	= require("./modules/connection.js")
var options 	= require("./config.js")

connection.query(
	'CREATE TABLE user (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'name VARCHAR(30),' +
	'points INT,' +
	'num_lines INT,' + 
	'level INT,' +  
	'isMod BOOL DEFAULT FALSE)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE streaminfo (' +
	'streamid VARCHAR(20) PRIMARY KEY,' +
	'date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
	'title VARCHAR(100),' +
	'game VARCHAR(100),' +
	'vod VARCHAR(100),' +
	'lowView INT,' +
	'currView INT,' + 
	'highView INT)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE commands (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'commandName VARCHAR(50),' +
	'response VARCHAR(500))',
	'level INT,' +
	'globalCd INT,' +
	'userCd INT)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE chatlogs (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
	'name VARCHAR(30),' +
	'log VARCHAR(500))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE adminlogs (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
	'type VARCHAR(10),' +
	'log VARCHAR(500))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE songrequest (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
	'name VARCHAR(30),' +
	'title VARCHAR(100),' +
	'thumb VARCHAR(250),' +
	'length INT,' +
	'songid VARCHAR(30),' +
	'playState INT DEFAULT FALSE)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE timeout (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'word VARCHAR(30),' +
	'type VARCHAR(30))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE dungeon (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'user VARCHAR(30),' +
	'win BOOL DEFAULT FALSE)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE module (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'moduleName VARCHAR(30),' +
	'moduleDescription VARCHAR(500),' +
	'state BOOL)',
	function (err, result) {if (err) {return}}
)

connection.query('insert into user set ? ', {"name": options.identity.admin, "points": 0, "num_lines": 0, "level": 500, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
if (options.identity.admin != options.channels[0]) {
	connection.query('insert into user set ? ', {"name": options.channels[0], "points": 0, "num_lines": 0, "level": 400, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
	connection.query('insert into user set ? ', {"name": options.identity.username, "points": 0, "num_lines": 0, "level": 300, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
} else {
	connection.query('insert into user set ? ', {"name": options.identity.username, "points": 0, "num_lines": 0, "level": 300, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
}

var sql = "insert into module (moduleName, moduleDescription, state) values ?";
var moduleSettings = [
	['useTwitchAPI', "All the commands that use the Twitch API to fetch data", true],
	['basicCommands', "Some of the bais commands to use", true],
	['updateProfile', "Creates a profile for each user with points, lines, etc.", true],
	['fetchProfile', "Fetches information from all users, such as points and lines", true],
	['owCommands', "Used to fetch the rank of any OW player", true],
	['roulette', "Point gambling mini-game", true],
	['slot', "Point gambling mini-game", true],
	['dungeon', "Point gambling mini-game with the entire chat", true],
	['fourtwenty', "Timer that notifies chat it's 16:20", true],
	['twitter', "Pushes the users Twitter each 20 minutes", true],
	['getSongs', "Songrequest from chat (player still buggy)", true],
	['mod', "Module that enables purge, timeout and ban words to be enabled", true],
	['sub', "Notifies chat if a user subs or resubs", true],
	["timeout", "Saves a log if a user is timed out or banned", true],
	["dungeonActive", "Dungeon", false]
];
connection.query(sql, [moduleSettings], function (err, result) {if (err) {console.log(err)}})

connection.end();