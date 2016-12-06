var basic = require('./basic.js');
var overwatch = require('./ow.js');
var timers = require('./timers.js')
var profile = require('./profile.js')

var exp = module.exports = {}

exp.commands = function() {
	basic.basicCommands();
	overwatch.owCommands();
	timers.fourtwenty();
	timers.test();
	profile.updateProfile();
	profile.fetchProfile();
};