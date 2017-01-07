var options	= require('../config.js')
var mysql 	= require("mysql");
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

        connection.connect(function(err){
            if(err) {
                console.log(err);
            }
        });
    }
    return connection;
}

module.exports = connectDatabase();