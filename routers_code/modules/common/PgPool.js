var pg = require('pg');
var config = require('config');
console.log('config', config);
// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var dbConfig = {
    user: config.get("dbConfig.user"), //env var: PGUSER
    database: config.get("dbConfig.database"), //env var: PGDATABASE
    password: config.get("dbConfig.password"), //env var: PGPASSWORD
    host: config.get("dbConfig.host"), // Server hosting the postgres database
    port: config.get("dbConfig.port"), //env var: PGPORT
    max: config.get("dbConfig.max"), // max number of clients in the pool
    idleTimeoutMillis: config.get("dbConfig.idleTimeoutMillis") // how long a client is allowed to remain idle before being closed
};

//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
var pool = new pg.Pool(dbConfig);

pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack)
});

module.exports = pool;
