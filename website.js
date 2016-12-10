var express       = require('express');
var app           = express();
var path          = require('path');
var request       = require("request");
var fs            = require('fs');
var songlistshit  = './static/json/songlistinfo.json'
var options       = require('./config.js')
var ytApiKey      = options.identity.ytApiKey

function removeShit() {
	fs.readFile(songlistshit, 'utf8', function(err, file) {if (err) {return}
	var result = file.replace("}]", "}, \n");
	fs.writeFile(songlistshit, result, 'utf8', function(err) {if (err) {return}})});
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