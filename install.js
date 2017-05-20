var options = require("./config.js")
var request = require("request");
var mysql = require("mysql");

connection = mysql.createConnection({
	host: 'localhost',
	user: options.mysql.user,
	password: options.mysql.password,
	database: options.mysql.database,
	port: 3306
});

connection.query(
	'CREATE TABLE user (' +
	'name VARCHAR(30) PRIMARY KEY,' +
	'userId VARCHAR(36),' +
	'accToken VARCHAR(30),' +
	'points INT,' +
	'xp INT DEFAULT 0,' +
	'num_lines INT,' +
	'level INT,' +
	'timeOnline INT DEFAULT 0,' +
	'timeOffline INT DEFAULT 0,' +
	'profile_pic VARCHAR(200),' +
	'isMod BOOL DEFAULT FALSE,' +
	'UNIQUE (name))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE userstats (' +
	'userId INT PRIMARY KEY,' +
	'slotLoss INT DEFAULT 0,' +
	'slotWin INT DEFAULT 0,' +
	'slotProfit INT DEFAULT 0,' +
	'dungWin INT DEFAULT 0,' +
	'dungProfit INT DEFAULT 0,' +
	'roulLoss INT DEFAULT 0,' +
	'roulWin INT DEFAULT 0,' +
	'roulProfit INT DEFAULT 0)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE emotestats (' +
	'id VARCHAR(50) PRIMARY KEY,' +
	'name VARCHAR(30),' +
	'type VARCHAR(30),' +
	'uses INT DEFAULT 1)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE clr (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'name VARCHAR(30),' +
	'url VARCHAR(2083),' +
	'type VARCHAR(30))',
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
	'points INT DEFAULT 0,' +
	'cdType VARCHAR(50),' +
	'cd INT)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE chatlogs (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
	'userId INT,' +
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
	'shortName VARCHAR(30),' +
	'moduleDescription VARCHAR(500),' +
	'type VARCHAR(30),' +
	'state BOOL)',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE modulesettings (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'moduleType VARCHAR(30),' +
	'settingName VARCHAR(30),' +
	'shortName VARCHAR(100),' +
	'value INT,' +
	'message VARCHAR(500))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE pollquestions (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'question VARCHAR(500))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE pollanswers (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'pollId VARCHAR(500),' +
	'answers VARCHAR(500))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE pollvoted (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'ip VARCHAR(500),' +
	'pollId VARCHAR(500),' +
	'answerId VARCHAR(500))',
	function (err, result) {if (err) {return}}
)

connection.query(
	'CREATE TABLE emotes (' +
	'id INT AUTO_INCREMENT PRIMARY KEY,' +
	'emoteId VARCHAR(30),' +
	'name VARCHAR(50),' +
	'type VARCHAR(10),' +
	'url VARCHAR(500))',
	function (err, result) {if (err) {return}}
)

console.log("[DEBUG] Added all tables")

connection.query('select * from user', function (err, result) {
	if (result[0] == undefined) {
		connection.query('insert into user set ? ', {"name": options.identity.admin, "points": 0, "num_lines": 0, "level": 500, "isMod": true },
		function (err, result) {if (err) {console.log(err)}})
		if (options.identity.admin != options.channels[0]) {
			connection.query('insert into user set ? ', {"name": options.channels[0], "points": 0, "num_lines": 0, "level": 400, "isMod": true },
			function (err, result) {if (err) {console.log(err)}})
			connection.query('insert into user set ? ', {"name": options.identity.username, "points": 0, "num_lines": 0, "level": 300, "isMod": true },
			function (err, result) {if (err) {console.log(err)}})
		} else {
			connection.query('insert into user set ? ', {"name": options.identity.username, "points": 0, "num_lines": 0, "level": 300, "isMod": true },
			function (err, result) {if (err) {console.log(err)}})
		}
	} else {
		console.log("[DEBUG] Didn't add users, already in table")
	}
})

var sql5 = "insert into clr (name, url, type) values ?"
var clrSamples = [
	["beer", "http://puu.sh/tXc6X/d75fb7a875.mp3", "sound"],
	["bottle", "http://puu.sh/tX9R5/4ce2a001f0.mp3", "sound"],
	["echo", "https://puu.sh/tNZm7/6fd06f6b2f.mp3", "sound"],
	["datboi", "https://puu.sh/rk6dH/5ba8a259f8.mp3", "sound"],
	["fuckyou", "http://puu.sh/tXc6X/d75fb7a875.mp3", "sound"],
	["zelda", "http://puu.sh/u0pld/34c6c39a2d.mp3", "sound"],
	["harro", "https://puu.sh/uf3iH/5fbf1d4b4f.mp3", "sound"],
	["bedankt", "https://puu.sh/ufdBg/b25699a14e.mp3", "sound"],
	["pepe", "https://media.giphy.com/media/FHCHRtwAZgGFq/giphy.gif", "gif"],
	["billy", "http://x3.wykop.pl/cdn/c3201142/comment_SbwUMF1MFEXwgaUpuZBAFuXbl5g6ZcYy.gif", "gif"],
	["kappa", "http://i.imgur.com/8TRbWHM.gif", "gif"],
	["go", "http://puu.sh/vNR7E/32ac03a631.mp4", "meme"],
	["skrt", "http://puu.sh/vNWvP/a8ea63181c.mp4", "meme"],
	["violin", "http://puu.sh/vNWx3/287ab583fc.mp4", "meme"],
	["hahahaha", "http://puu.sh/vNWxC/9f1ce6d63b.mp4", "meme"],
	["reeee", "http://puu.sh/vNWzd/2a43408c50.mp4", "meme"],
	["lemons", "http://puu.sh/vNWzK/acb2ce8b40.mp4", "meme"],
	["aaaaa", "http://puu.sh/vNWA2/1b4455d81d.mp4", "meme"],
	["dog", "http://puu.sh/vNWAx/040a4dfc2b.mp4", "meme"]
]

connection.query('select * from clr', function (err, result) {
	if (result[0] == undefined) {
		connection.query(sql5, [clrSamples], function (err, result) {console.log("[DEBUG] Added all CLR samples")})
	} else {
		console.log("[DEBUG] Didn't add CLR samples, already in table")
	}
})

var sql4 = "insert into modulesettings (moduleType, settingName, shortName, value, message) values ?"
var moduleSettingsPreset = [
	["songrequest", "srSub", "Sub-only songrequest", 1, null],
	["songrequest", "srMaxSong", "Max songs in queue", 3, null],
	["songrequest", "srMaxLength", "Max songlength (in seconds)", 600, null],
	["roulette", "roulMin", "Minimum amount of points for roulette", 10, null],
	["roulette", "roulCd", "Cooldown (in seconds)", 300, null],
	["slot", "slotCd", "Cooldown (in seconds)", 300, null],
	["updatePoints", "amountPoints", "Points per interval", 5, null],
	["subNotif", "subMsg", "New subcribers message", null, "Thanks for subbing [username] with a [plan] sub! PogChamp"],
	["subNotif", "resubMsg", "Resubscriber message", null, "Thanks for resubbing [username] for [months] months using a [plan] sub! PogChamp"],
	["linkMod", "linkSubOnly", "Allow subs to post links", 1, null],
	["linkMod", "linkTimeoutTime", "imeout for posting links (in seconds)", 20, null],
	["clrComm", "clrCost", "Cost per CLR command", 1000, null],
	["clrComm", "clrCd", "Cooldown (in seconds)", 120, null]
]

connection.query('select * from modulesettings', function (err, result) {
	if (result[0] == undefined) {
		connection.query(sql4, [moduleSettingsPreset], function (err, result) {console.log("[DEBUG] Added all module settings")})
	} else {
		console.log("[DEBUG] Didn't add moduele settings, already in table")
	}
})

var sql = "insert into module (shortName, moduleName, moduleDescription, state, type) values ?";
var moduleSettings = [
	// Main modules
	[null, "dungeonActive", "Dungeon", false, null],
	["Basic features", "basic", "Some basic commands and features", true, "main"],
	["Fun commands", "fun", "A few fun commands for in the chat", false, "main"],
	["Point commands", "points", "Point gambling commands", true, "main"],
	["Profile", "profile", "Point system and creates profile for each user in the stream", true, "main"],
	["Events", "events", "Different events that trigger in chat", true, "main"],
	["Moderation", "mod", "Adds moderation to the bot", true, "main"],
	["CLR", "clr", "Features that enables chat interaction through CLR browser", true, "main"],
	// Sub modules
	["Info commands", "info", "Commands with info about the stream", true, "basic"],
	["Custom commands", "custom", "Custom commands that can be added through chat or admin panel", true, "basic"],
	["Songrequest", "songrequest", "Enables songrequest for users in chat", true, "basic"],
	["Emotes", "emotes", "Enables the tracking of emote usage in chat", true, "basic"],
	["Google", "google", "Google a question for chat", false, "fun"],
	["OW Rank", "ow", "Checks Overwatch rank for streamer or custom input", false, "fun"],
	["Roulette", "roulette", "Enables the !roulette command", true, "points"],
	["Slot", "slot", "Enables the !slot command", true, "points"],
	["Dungeons", "dungeon", "Enables the dungeons", false, "points"],
	["Chat logger", "logger", "Log every message in chat", true, "profile"],
	["Point system", "updatePoints", "Point system ", true, "profile"],
	["Profile commands", "profileComm", "Enables commands to retrieve profile info", true, "profile"],
	["Sub notifier", "subNotif", "Notifies when there's a new sub in chat", true, "events"],
	["420 timer", "fourTwenty", "Pushes messages to chat at 16:20", false, "events"],
	["Twitter timer", "twitter", "Pushes your Twitter to chat every 20 min", false, "events"],
	["Ban words", "banWords", "Enables the banning of words", false, "mod"],
	["Link moderation", "linkMod", "Disallow links from non subs", true, "mod"],
	["CLR Commands", "clrComm", "Commands that triggers CLR sounds or images / GIFS", true, "clr"],
	["Chat emotes", "clrComm", "Sends every emote said in chat to the CLR", false, "clr"],
	["Meme button", "clrMeme", "Meme button for CLR", false, "clr"],
	["Clr sub notifier", "clrSub", "Sub alert on CLR", false, "clr"]
];

connection.query('select * from module', function (err, result) {
	if (result[0] == undefined) {
		connection.query(sql, [moduleSettings], function (err, result) {console.log("[DEBUG] Added all modules")})
	} else {
		console.log("[DEBUG] Didn't add modules, already in table")
	}
})

var sql2 = "insert into commands (commName, response, commDesc, cdType, cd, level, commUse, points) values ?"
var standardCommands = [
	["!test", "This is a command xD", null, "user", 10, 100, null, 0],
	["!repo", "You can find the GitHub repo for the bot over at https://github.com/Mstiekema/Yucibot", null, "user", 10, 100, null, 0],
	["!google", null, "Makes a google search for you", "global", 10, 100, "!google Where can I download more ram?", 0],
	["!lmgtfy", null, "Makes a let me Google that for you search", "global", 10, 100, "!lmgtfy Where can I find the nearest KFC?", 0],
	["!viewers", null, "Returns the current viewcount if the stream is live", "global", 10, 100, null, 0],
	["!followage", null, "Shows the followage of a user", "global", 10, 100, null, 0],
	["!followage", null, "Shows the age of following of a user", "global", 10, 100, null, 0],
	["!game", null, "Returns the current game if the stream is live", "global", 10, 100, null, 0],
	["!title", null, "Returns the current title if the stream is live", "global", 10, 100, null, 0],
	["!uptime", null, "Shows how long the stream has been live for", "global", 10, 100, null, 0],
	["!topemotes", null, "Returns the top 5 most used emotes in chat", "global", 120, 100, null, 0],
	["!owrank", null, "Returns the streamer's or the user's OW rank", "global", 10, 100, "!owrank Mstiekema#2237", 0],
	["!roulette", null, "Fun point minigame where you can gamble with your points", "user", 300, 100, "!roulette 12345", 0],
	["!slot", null, "Fun point minigame where you can gamble with your points", "user", 300, 100, null, 0],
	["!enter", null, "Joins the dungeon queue, if one is active", "user", 1, 100, null, 0],
	["!rq", null, "Returns a random recorded quote from the current user", "user", 30, 100, null, 0],
	["!points", null, "Bot whispers your amount of points", "global", 5, 100, null, 0],
	["!usage", null, "Shows you how many times an emote has been used", "global", 20, 100, "!usage EMOTE", 0],
	["!lines", null, "Returns the amount of lines the user has typed", "global", 20, 100, null, 0],
	["!totallines", null, "Returns the total recorded lines in chat", "global", 30, 100, null, 0],
	["!clr", null, "Commands from the CLR module", "global", 10, 110, null, 1000],
	["!currentsong", null, "Returns the song that's currently playing", "global", 1, 100, null, 0],
	["!songrequest", null, "Allows subs to request songs in chat", "global", 10, 150, "!songrequest Enjoy the silence - Depeche Mode | \
	!songrequest https://www.youtube.com/watch?v=aGSKrC7dGcY | !songrequest aGSKrC7dGcY", 0],
	["!resetpoints", null, "Resets the points of the target", "global", 10, 300, "!resetpoints Mstiekema", 0],
	["!emoteupdate", null, "Updates all the trackable emotes", "global", 1, 300, null, 0],
	["!addpoints", null, "Adds points to the target", "user", 1,300, "!addpoints kimodaptyl 12345", 0],
	["!addcommand", null, "Adds a command to the bot", "user", 1, 300, "!addcommand !test This is a testing command :)", 0],
	["!removecommand", null, "Removes a command from the bot", "global", 10, 300, "!remove command !test", 0],
	["!addpurge", null, "Adds a purge word to the banlist", "user", 1, 300, "!addpurge fuck", 0],
	["!addtimeout", null, "Adds a timeout word to the banlist", "user", 1, 300, "!addtimeout fuck", 0],
	["!addban", null, "Adds a ban word to the banlist", "user", 1, 300, "!addtimeout fuck", 0],
	["!permit", null, "Allows a user to post a link in chat for 30 seconds", "global", 1, 300, "!permit mstiekema", 0],
	["!skip", null, "Skips the song that's currently playing", "global", 10, 300, null, 0],
	["!removesong", null, "Removes a song that's in the queue", "global", 10, 300, "!removesong YT-ID", 0],
	["!volume", null, "Returns the volume of the songlist player", "global", 1, 300, null, 0],
	["!setvolume", null, "Sets the volume to a certain number between 0-100", "global", 1, 300, "!setvolume 69", 0],
	["!quit", null, "Makes the bot quit", "user", 1, 300, null, 0]
]

connection.query('select * from commands', function (err, result) {
	if (result[0] == undefined) {
		connection.query(sql2, [standardCommands], function (err, result) {console.log("[DEBUG] Added all commands")})
	} else {
		console.log("[DEBUG] Didn't add commands, already in table")
	}
})

var sql3 = "insert into emotes (name, emoteId, type, url) values ?"
var emotes = new Array;
var chnl = JSON.stringify(options.channels).slice(2, -2);

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
request('https://api.betterttv.net/2/channels/' + chnl, function (error, response, body) {
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
request('http://api.frankerfacez.com/v1/room/' + chnl, function (error, response, body) {
	var base = JSON.parse(body)
	if (!base["room"]) return
	var roomid = base["room"]["set"]
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

setTimeout(function () {
	connection.query('select * from emotes', function (err, result) {
		if (result[0] == undefined) {
			connection.query(sql3, [emotes], function (err, result) {console.log("[DEBUG] Added all emotes")})
		} else {
			console.log("[DEBUG] Didn't add emotes, already in table")
		}
	})
}, 7000);

setTimeout(function () {
	connection.end();
	console.log("[DEBUG] Finished installing")
}, 12000);
