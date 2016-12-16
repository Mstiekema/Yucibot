var tmi 	= require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot 	= connect.bot
var request = require("request");
var fs 		= require('fs');

module.exports = {

	dungeon: function () {
		bot.on('message', function(channel, user, message, self) {
			var file = './static/json/dungeon.json'
			
			function toAdminLog(toLog) {
				var time = new Date(); 
				var day = time.getDate(); 
				var month = time.getMonth(); 
				var year = time.getFullYear();
				var hours = time.getHours(); 
				var minutes = time.getMinutes(); 
				var seconds = time.getSeconds();
				var logTime = "[" + day + '-' + month + '-' + year + " / " + hours + ':' + minutes + ':' + seconds + "] "
				var toLog = logTime + toLog
				getLog = JSON.parse(fs.readFileSync('./static/json/logs.json', 'utf8'))
				getLog.points.push(toLog)
				newLog = JSON.stringify(getLog)
				fs.writeFileSync('./static/json/logs.json', newLog)
			}
			
			if (message.startsWith("!startdungeon") && (user.username === channel.substring(1) || user.mod === true)) {
				fs.writeFileSync(file, '{"participants":[],"winners":[],"enabled":true}')
				bot.say(channel, "The dungeon queue has started! Type !enter in the chat to join the queue")

				function doDungeonOpt(chance) {
					var participants = JSON.parse(fs.readFileSync(file, 'utf8')).participants
					bot.say(channel, "Leeeeet's do this! " + participants.length + " adventurers are entering the dungeon!")
					var winP = ((participants.length * Math.random()) * chance)
					var empty = JSON.stringify([])
					var winners = Math.floor(winP / 110) + 1
					if (winners > 7) {
						winners = winners - 3
						var pointPool = participants.length * 100
						console.log("Winners: " + winners)
						for(x = 0; x < winners; ++x) {
							var getFile = JSON.parse(fs.readFileSync(file, 'utf8'))
							var count = Object.keys(getFile.participants).length;
							var i = Math.floor(Math.random() * count);
							var winner = getFile.participants[i]
							getFile.participants.splice(i, 1);
							getFile.winners.push(winner)
							newUserFile = JSON.stringify(getFile)
							fs.writeFileSync(file, newUserFile)
						}
						poolDiv = Math.floor(pointPool / winners)
						console.log("Pooldiv: " + poolDiv)
						bot.say(channel, getFile.winners + " each won " + poolDiv + " points! PogChamp //")
						fs.writeFileSync(file, '{"participants":[],"winners":[],"enabled":false}')
					} else {
						var pointPool = participants.length * 100
						console.log("Winners: " + winners)
						for(x = 0; x < winners; ++x) {
							var getFile = JSON.parse(fs.readFileSync(file, 'utf8'))
							var count = Object.keys(getFile.participants).length;
							var i = Math.floor(Math.random() * count);
							var winner = getFile.participants[i]
							getFile.participants.splice(i, 1);
							getFile.winners.push(winner)
							newUserFile = JSON.stringify(getFile)
							fs.writeFileSync(file, newUserFile)
						}
						poolDiv = Math.floor(pointPool / winners)
						console.log("Pooldiv: " + poolDiv)
						// Points to userfiles \\\
						bot.say(channel, getFile.winners + " each won " + poolDiv + " points! PogChamp //")
						fs.writeFileSync(file, '{"participants":[],"winners":[],"enabled":false}')
						var toLog = getFile.winners + ' won ' + poolDiv + ' points each with a dungeon.'
						toAdminLog(toLog);
					}
				}

				function doDungeon() {
					var participants = JSON.parse(fs.readFileSync(file, 'utf8')).participants
					if (participants.length < 10) {
						bot.say(channel, "Less than 10 people joined the dungeon party, this isn't enough to start the dungeon FeelsBadMan")
						fs.writeFileSync(file, '{"participants":[],"winners":[],"enabled":false}')
					}
					else if (participants.length < 50) {
						doDungeonOpt(30)
					}
					else if (participants.length < 75) {
						doDungeonOpt(25)
					}
					else if (participants.length < 100) {
						doDungeonOpt(20)
					}
					else if (participants.length < 125) {
						doDungeonOpt(10)
					}
					else if (participants.length < 150) {
						doDungeonOpt(7)
					}
					else if (participants.length > 150) {
						doDungeonOpt(5)
					}
					else {
						bot.say(channel, "A weird error occured, please contact Mstiekema if you see this :/")
					}
				}
				setTimeout(doDungeon, 120000)
			}

			if (message.startsWith("!enter")) {
				user = user.username
				var getFile = JSON.parse(fs.readFileSync(file, 'utf8'))
				if(getFile.enabled === true) {
					if (getFile.participants.includes(user)) {
						bot.whisper(user, "I'm sorry but you can't participate multiple times :/")
					} 
					else {
						getFile.participants.push(user)
						newUserFile = JSON.stringify(getFile)
						fs.writeFileSync(file, newUserFile)
						bot.whisper(user, "You succesfully joined the dungeon! Good luck PogChamp")
					}
				}
				else {
					bot.whisper(user, "There's no dungeon currently active :/")
				}
			}
		});
	}
}