var express = require('express');
var app = express();
var path = require('path');
var request = require("request");
var fs = require('fs');
var songlistshit = './static/json/songlistinfo.json'
var allSongs = require('./static/json/songlist.json')
var options = require('./config.js')
var ytApiKey = options.identity.ytApiKey

function removeShit() {
	fs.readFile(songlistshit, 'utf8', function(err, file) {if (err) {return}
	var result = file.replace("}]", "}, \n");
	fs.writeFile(songlistshit, result, 'utf8', function(err) {if (err) {return}})});
}

requestVideoInfo(0)

function requestVideoInfo(count) {
  if(count < allSongs.length) {
    ytId = allSongs[count]
    request("https://www.googleapis.com/youtube/v3/videos?id=" + ytId + "&key=" + ytApiKey + "%20&part=snippet,contentDetails,statistics,status", function (error, response, body) {
      var sd = JSON.parse(body);
      var xd = sd.items[0].snippet.title
      var aus = sd.items[0].snippet
      name = aus.title
      tn = aus.thumbnails.default.url
      var data = '\n{"name": "' + name + '", "user": "Mstiekema", "img": "' + tn + '"}]'
      fs.appendFile(songlistshit, data, 'utf8', function(err) {
        if (err)
          console.log('Error', e);
        else
          requestVideoInfo(++count);
      // start to request the next video into once this one is done
      })
    })
    removeShit();
  }
  else if(count - 1 == allSongs.length) {
    ytId = allSongs[count]
    request("https://www.googleapis.com/youtube/v3/videos?id=" + ytId + "&key=" + ytApiKey + "%20&part=snippet,contentDetails,statistics,status", function (error, response, body) {
      var sd = JSON.parse(body);
      var xd = sd.items[0].snippet.title
      var aus = sd.items[0].snippet
      name = aus.title
      tn = aus.thumbnails.default.url
      var data = '\n{"name": "' + name + '", "user": "Mstiekema", "img": "' + tn + '"}]'
      fs.appendFile(songlistshit, data, 'utf8', function(err) {
        if (err)
          console.log('Error', e);
        else
          requestVideoInfo(++count);
      // start to request the next video into once this one is done
      })
    })
  }
}


app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/index.html'));
});

app.get('/user', function(req, res) {
	res.sendFile(path.join(__dirname + '/templates/error.html'))
});

app.get('/commands', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/commands.html'));
});

app.get('/songlist', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/songlist.html'));
});

console.log("Started website")

app.listen(3000);