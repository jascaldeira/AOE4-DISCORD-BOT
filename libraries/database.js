var config = require('../config.json');
const { createConnection } = require('mysql');
// Prepare the mysql connection
//let con = createConnection(config.mysql);
let con;

function handleDisconnect(localconfig) {
    con = createConnection(localconfig.mysql); // Recreate the connection, since
    // the old one cannot be reused.

    
    con.connect(err => {
        // Console log if there is an error
        if (err) {
            //console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }
    
        // No error found?
        //console.log(`MySQL has been connected!`);
    });
    // If you're also serving http, display a 503 error.
    con.on('error', function (err) {
        //console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect(config);

module.exports = con;