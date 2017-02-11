var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")
var CronJob = require('cron').CronJob;
var clientID = options.identity.clientId

module.exports = {
	fetchInfo: function() {
		var job = new CronJob('*/1 * * * *', function() {
			var info = {
				url: 'https://api.twitch.tv/kraken/streams?channel=' + JSON.stringify(options.channels).slice(3, -2),
				headers: {
					'Client-ID': clientID
				}
			}
			request(info, function (error, response, body) {
				if (JSON.parse(body).streams[0] != undefined) {
					var base = JSON.parse(body).streams[0]
					var streamid = base._id
					func.connection.query('select * from streaminfo where streamid = ?', streamid, function(err, result) {
						if (result[0] != undefined) {
							var currView = parseInt(base.viewers)
							var lowView = result[0].lowView
							var highView = result[0].highView
							if(currView < lowView) {
								var newInfo = {
									currView: currView,
									lowView: currView
								}
								func.connection.query('update streaminfo set ? where streamid = "' + streamid + '"', newInfo, function (err, result) {if (err) {return}})
							} else if(currView > highView) {
								var newInfo = {
									currView: currView,
									highView: currView
								}
								func.connection.query('update streaminfo set ? where streamid = "' + streamid + '"', newInfo, function (err, result) {if (err) {return}})
							} else {
								var newInfo = {
									currView: currView
								}
								func.connection.query('update streaminfo set ? where streamid = "' + streamid + '"', newInfo, function (err, result) {if (err) {return}})
							}
							oldGame = result[0].game
							newGame = base.game
							if (!oldGame.includes(newGame)) {
								var newInfo = {
									game: oldGame + " " + newGame
								}
								func.connection.query('update streaminfo set ? where streamid = "' + streamid + '"', newInfo, function (err, result) {if (err) {return}})
							}
							console.log("[DEBUG] Updated stream info")
						}
						else {
							var info = {
								url: 'https://api.twitch.tv/kraken/channels/'+  JSON.stringify(options.channels).slice(3, -2) + '/videos?broadcasts=true',
								headers: {
									'Client-ID': clientID
								}
							}
							request(info, function (error, response, body) {
								var SI = {
									streamid: streamid,
									title: base.channel.status,
									game: base.game,
									currView: base.viewers,
									lowView: base.viewers,
									highView: base.viewers,
									vod: JSON.parse(body).videos[0].url
								}
								func.connection.query('insert into streaminfo set ?', SI, function (err, result) {if (err) {console.log(err)}})
							})
							console.log("[DEBUG] A new stream has started")
							bot.say(JSON.stringify(options.channels).slice(2, -2), "A new stream has started, welcome guys! PogChamp")
						}
					});
				}
			})
		}, function () {}, true );
	}
}
