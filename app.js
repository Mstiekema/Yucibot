var tmi = require('tmi.js');
var options = require('./config.js')
var bot = new tmi.client(options);
var fs = require('fs');
var request = require("request");

bot.connect();

bot.on('connected', function (channel) {
	console.log("Bot connected to channel")
	bot.action(channel, "Yucibot connected MrDestructoid")
});


//Basic commands
//I have to move this to a /commands map and import them from there
bot.on('message', function (channel, user, message, self) {
	 if (message.startsWith("!test")) {
    	bot.say(channel, "This is a command xD")
	   	console.log('Did the thing')
	}
	else if (message.startsWith("!twitter")) {
		bot.say(channel, "Merijn his Twitter is https://www.twitter.com/Mstiekema_")
	}
	else if (message.startsWith("!slap")) {
		bot.say(channel, user.username + " slapped" + message.substring(message.indexOf(" ")) + " in the face")
	}
	else if (message.startsWith("1quit")) {
		if (user.mod === true || user.username == channel.substring(1)) {
			bot.say(channel, "Shutting down Yucibot MrDestructoid")
			bot.disconnect()}
		else {
			bot.say(channel, "You are not allowed to turn off the bot OMGScoots")
		};
	}
	else if (message.includes("Alliance") || message.includes("alliance")) {
		bot.say(channel, "LOK'TAR OGAR, FOR THE HORDE SMOrc")
	};
});

// Overwatch commands
bot.on('message', function(channel, user, message, self) {
	if(message.startsWith("!owrank")) {
		if(message.length < 8) {
			request('https://api.lootbox.eu/pc/eu/' + options.identity.owUser + '/profile', function (error, response, body) {
			var rank = JSON.parse(body);
			bot.say(channel, channel.substring(1) + " is op het moment rank " + rank.data.competitive.rank + " in Overwatch! PogChamp")});
		}
		else {
			var userOW = message.split(' ');
			request('https://api.lootbox.eu/pc/eu/' + userOW[1] + '/profile', function (error, response, body) {
				var rank = JSON.parse(body);
				bot.say(channel, userOW[1] + " is op het moment rank " + rank.data.competitive.rank + " in Overwatch! PogChamp")});
				
		}
	};
}	)

process.on('uncaughtException', function(err) {
    console.log(err)
});


// Chat logger
bot.on('message', function (channel, user, message, self) {
	// Logging messages	
	var time = new Date();
	var day = time.getDate();
	var month = time.getMonth();
	var year = time.getFullYear();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var seconds = time.getSeconds();
	var logDate = [day + '-' + month + '-' + year]
	var logTime = [hours + ':' + minutes + ':' + seconds]
	var file = './logs/_' + user.username + '.json'
		// The part that goes into the .json file
	var log = [ 
		'{' + 
		'"date": ' + '"' + logDate + '", ' +
		'"time": ' + '"' + logTime + '", ' +
		'"chatter": ' + '"' + user.username + '", ' +
		'"message": ' + '"' + message + '"'
		+ '} ]}'
	]
	var logNew = [
	'{"messages": [ \n'
	+ log
	]


if (fs.existsSync(file)) { 
	// Replace end of log-file 
	function removeFromLog() {
		fs.readFile(file, 'utf8', function(err, data) {
    		if (err) {
    		  return console.log(err);
    		}
     
    		var result = data.replace("]}",", \n");
    		fs.writeFile(file, result, 'utf8', function(err) {
    		    if (err) {
    		       return console.log(err);
    		    }
    		})
	});}

	// Write to log file
	function writeToLog() {
		fs.appendFile(file, log, function(err){
			if(err) {		
				return console.log(err);
	}});}

	// Call both functions
	removeFromLog();
	setTimeout(writeToLog, 10);
}
else {
	fs.appendFile(file, logNew, function(err){
			if(err) {		
				return console.log(err);
	}});
}



	if (message.startsWith("!rq")) {
		var obj = JSON.parse(fs.readFileSync('./logs/_' + user.username + '.json', 'utf8'));
		var count = Object.keys(obj.messages).length;
		var i = Math.floor(Math.random() * count);
		bot.say(channel, obj.messages[i].chatter + ': ' + obj.messages[i].message)
	};
}); 
