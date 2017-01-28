var options	= require('../config.js')
var mysql = require("mysql");
var connection;

function connectDatabase() {
    if (!connection) {
        connection = mysql.createConnection({
			host: 'localhost',
			user: options.mysql.user,
			password: options.mysql.password,
			database: options.mysql.database,
			port: 3306
		});
        connection.connect(function(err) {
            if(err) {
                console.log('error when connecting to db:', err);
                setTimeout(connectDatabase, 2000);
            }
        });
        connection.on('error', function(err) {
            console.log('db error', err);
            if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                connectDatabase();
            } else {
                connectDatabase();
                throw err;
            }
        });
    }
    return connection;
}

module.exports = connectDatabase();