var bc = require('./basic.js');
var ow = require('./ow.js');

var exp = module.exports = {}

exp.commands = function() {
	bc.basicCommands();
	ow.owCommands();
};