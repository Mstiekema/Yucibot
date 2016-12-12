var express = require('express');
var app     = express();
var path    = require('path');
var request = require("request");
var fs 		= require('fs');
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

app.get('/songlist', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/songlist.html'));
});

app.get('/history/:id', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/history.html'));
});

app.get('/history', function(req, res) {
    res.redirect('/history/'+ date);
    res.sendFile(path.join(__dirname + '/templates/history.html'));
});

console.log("Started website")

app.listen(3000);