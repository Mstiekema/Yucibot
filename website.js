var express = require('express');
var app     = express();
var path    = require('path');
var request = require("request");
var fs 		= require('fs');
var file = './static/json/modules.json'
var time 	= new Date();
var day 	= time.getDate();
var month 	= time.getMonth() + 1;
var year 	= time.getFullYear();
var date	= year + "-" + month + "-" + day;

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/index.html'));
});

app.get('/user/:id', function(req, res) {
	res.sendFile(path.join(__dirname + '/templates/user.html'))
});

app.get('/user/:id/logs', function(req, res) {
	res.sendFile(path.join(__dirname + '/templates/logs.html'))
});

app.get('/commands', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/commands.html'));
});

app.get('/history/:id', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/history.html'));
});

app.get('/history', function(req, res) {
    res.redirect('/history/'+ date);
    res.sendFile(path.join(__dirname + '/templates/history.html'));
});

app.get('/admin', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/admin/home.html'));
});

app.get('/admin/songlist', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/admin/songlist.html'));
});

app.get('/admin/pointlogs', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/admin/pointlogs.html'));
});

app.get('/admin/modules', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/admin/modules.html'));
});

app.get('/admin/modules/:format/:type', function(req, res) {
    format = req.params.format
    state = JSON.parse(req.params.type)
    var json = JSON.parse(fs.readFileSync(file, 'utf8'))
    if(json.modules.indexOf(format)) {
        if(format === "twitchapi") {
            json.modules[0].twitchapi = state
            fs.writeFile(file, JSON.stringify(json, null, 2))
        } 
        else if (format === "overwatch") {
            json.modules[0].overwatch = state
            fs.writeFile(file, JSON.stringify(json, null, 2))
        }
        else if (format === "updatePoints") {
            json.modules[0].updatePoints = state
            fs.writeFile(file, JSON.stringify(json, null, 2))
        }
        else if (format === "pointCommands") {
            json.modules[0].pointCommands = state
            fs.writeFile(file, JSON.stringify(json, null, 2))
        }
        else if (format === "fetchProfile") {
            json.modules[0].fetchProfile = state
            fs.writeFile(file, JSON.stringify(json, null, 2))
        }
        else if (format === "dungeon") {
            json.modules[0].dungeon = state
            fs.writeFile(file, JSON.stringify(json, null, 2))
        }
        else {
            console.log("[DEBUG] Undefined module")
        }
    }
    else {
        console.log("[DEBUG] Module not found in database")
    }
    res.redirect('/admin/modules')
});

console.log("Started website")

app.listen(3000);