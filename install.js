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
	'commName VARCHAR(50),' +
	'response VARCHAR(500),' +
	'commDesc VARCHAR(500),' +
	'commUse TEXT,' +
	'level INT DEFAULT 100,' +
	'cdType VARCHAR(50),' +
	'cd INT)',
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

// connection.query('insert into user set ? ', {"name": options.identity.admin, "points": 0, "num_lines": 0, "level": 500, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
// if (options.identity.admin != options.channels[0]) {
// 	connection.query('insert into user set ? ', {"name": options.channels[0], "points": 0, "num_lines": 0, "level": 400, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
// 	connection.query('insert into user set ? ', {"name": options.identity.username, "points": 0, "num_lines": 0, "level": 300, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
// } else {
// 	connection.query('insert into user set ? ', {"name": options.identity.username, "points": 0, "num_lines": 0, "level": 300, "isMod": true }, function (err, result) {if (err) {console.log(err)}})
// }

var sql = "insert into module (moduleName, moduleDescription, state) values ?";
var moduleSettings = [
	["dungeonActive", "Dungeon", false],
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
	['link', "Gives non-subs a 20 second timeout if they post a link in chat", true],
	['sub', "Notifies chat if a user subs or resubs", true],
	['timeout', "Saves a log if a user is timed out or banned", true],
];
// connection.query(sql, [moduleSettings], function (err, result) {if (err) {console.log(err)}})

var sql2 = "insert into commands (commName, response, commDesc, cdType, cd, level, commUse) values ?"
var standardCommands = [
	["!test", "This is a command xD", null, "user", 10, 100, null],
	["!repo", "You can find the GitHub repo for the bot over at https://github.com/Mstiekema/Yucibot", null, "user", 10, 100, null],
	["!google", null, "Makes a google search for you", "global", 10, 100, "!google Where can I download more ram?"],
	["!lmgtfy", null, "Makes a let me Google that for you search", "global", 10, 100, "!lmgtfy Where can I find the nearest KFC?"],
	["!viewers", null, "Returns the current viewcount if the stream is live", "global", 10, 100, null],
	["!game", null, "Returns the current game if the stream is live", "global", 10, 100, null],
	["!title", null, "Returns the current title if the stream is live", "global", 10, 100, null],
	["!owrank", null, "Returns the streamer's or the user's OW rank", "global", 10, 100, "!owrank Mstiekema#2237"],
	["!roulette", null, "Fun point minigame where you can gamble with your points", "user", 300, 100, "!roulette 12345"],
	["!slot", null, "Fun point minigame where you can gamble with your points", "user", 300, 100, null],
	["!enter", null, "Joins the dungeon queue, if one is active", "user", 1, 100, null],
	["!rq", null, "Returns a random recorded quote from the current user", "user", 30, 100, null],
	["!points", null, "Bot whispers your amount of points", "global", 5, 100, null],
	["!lines", null, "Returns the amount of lines the user has typed", "global", 20, 100, null],
	["!totallines", null, "Returns the total recorded lines in chat", "global", 30, 100, null],
	["!currentsong", null, "Returns the song that's currently playing", "global", 1, 100, null],
	["!songrequest", null, "Allows subs to request songs in chat", "global", 10, 150, "!songrequest Enjoy the silence - Depeche Mode | !songrequest https://www.youtube.com/watch?v=aGSKrC7dGcY | !songrequest aGSKrC7dGcY"],
	["!resetpoints", null, "Resets the points of the target", "global", 10, 300, "!resetpoints Mstiekema"],
	["!addpoints", null, "Adds points to the target", "user", 1,300, "!addpoints kimodaptyl 12345"],
	["!addcommand", null, "Adds a command to the bot", "user", 1, 300, "!addcommand !test This is a testing command :)"],
	["!removecommand", null, "Removes a command from the bot", "global", 10, 300, "!remove command !test"],
	["!addpurge", null, "Adds a purge word to the banlist", "user", 1, 300, "!addpurge fuck"],
	["!addtimeout", null, "Adds a timeout word to the banlist", "user", 1, 300, "!addtimeout fuck"],
	["!addban", null, "Adds a ban word to the banlist", "user", 1, 300, "!addtimeout fuck"],
	["1quit", null, "Makes the bot quit", "user", 1, 300, null]
]
connection.query(sql2, [standardCommands], function (err, result) {if (err) console.log(err)})

connection.end();
