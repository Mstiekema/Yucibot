var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var fs = require('fs');
var Bottleneck = require("bottleneck");
var limiter = new Bottleneck(0, 5000, 0);
var CronJob = require('cron').CronJob;
var request = require("request");
var mkdirp = require('mkdirp');

module.exports = {

updateProfile: function () {

bot.on('message', function (channel, user, message, self) {

var file = './user/_' + user.username + '/logs.json'
var profFile = './user/_' + user.username + '/profile.json'

	var time = new Date();
	var day = time.getDate();
	var month = time.getMonth();
	var year = time.getFullYear();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var seconds = time.getSeconds();
	var logDate = [day + '-' + month + '-' + year]
	var logTime = [hours + ':' + minutes + ':' + seconds]
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
	var profNew = [
		"{\n" +
			'"profile": {\n' +
			'"points": 0,\n' +
			'"lines": 0\n' +
		'}\n' +
		"}"
		]

if (fs.existsSync(file || profFile)) {

addLine = function() {
	linesGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
	linesGet.profile.lines = linesGet.profile.lines + 1
	fs.writeFile(profFile, JSON.stringify(linesGet, null, 2))
}

setTimeout(addLine, 100)

	// Replace end of log-file
	function removeFromLog() {
		fs.readFile(file, 'utf8', function(err, data) {
    		if (err) {
    		  return
    		}

    		var result = data.replace("]}", ", \n");
    		fs.writeFile(file, result, 'utf8', function(err) {
    		    if (err) {
    		       return
    		    }
    		})
		});
	}

	// Write to log file
	function writeToLog() {
		fs.appendFile(file, log, function(err){
			if(err) {
				return
			}
		})
	};

	// Call both functions
	removeFromLog();
	setTimeout(writeToLog, 100);
	}
	else {
		mkdirp('./user/_' + user.username, function(err) {}); 
		fs.appendFile(profFile, profNew, function(err){
			if(err) {
				return;
			}
		});
		mkdirp('./user/_' + user.username, function(err) {}); 
		fs.appendFile(file, logNew, function(err){
			if(err) {
				return
		}});
	}
}


);
},

fetchProfile: function() {

bot.on('message', function (channel, user, message, self) {

	// Get randomline
	if (message.startsWith("!rq")) {
		function parseJSON() {
			var obj = JSON.parse(fs.readFileSync('./user/_' + user.username + '/logs.json', 'utf8'));
			var count = Object.keys(obj.messages).length;
			var i = Math.floor(Math.random() * count);
			bot.say(channel, obj.messages[i].chatter + ': ' + obj.messages[i].message)
		}
		function giveRQ() {
			setTimeout(parseJSON, 200)
		}
		limiter.submit(giveRQ);
	};

	var pointStoreFile = './user/_' + user.username + '/profile.json';
	if (message.startsWith("!lines")) {
		if (fs.existsSync(pointStoreFile)) {
			pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
			bot.say(channel, "You have written " + pointsGet.profile.lines + " lines in this chat!")
		}
	}
	if (message.startsWith("!addpoints")) {
		if (fs.existsSync(pointStoreFile) && (user.mod === true || user.username == channel.substring(1))) {
			var pointStoreFile = './user/_' + user.username + '/profile.json';
			pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
			pointsGet.profile.points = pointsGet.profile.points + 1000
			fs.writeFile(pointStoreFile, JSON.stringify(pointsGet, null, 2))
			bot.say(channel, "Added 1000 points", message.substring(message.indexOf(" ")))
		}
	}
	if (message.startsWith("!points")) {
		if (fs.existsSync(pointStoreFile)) {
			var pointStoreFile = './user/_' + user.username + '/profile.json';
			pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
			bot.say(channel, "You have " + pointsGet.profile.points + " points!")
		}
	}
});
}}