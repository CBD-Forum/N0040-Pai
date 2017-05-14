#!/usr/bin/env node
//var debug = require('debug')('server');
// var heapdump = require('heapdump');
var app = require('../app');
var logger = require('../loggerFactory').getLogger('routers');

/*var cluster = require('cluster');
if (cluster.isMaster) {
    // calculate number of proccesses to fork
    var num_cpus = require('os').cpus().length;
    var num_processes = Math.max(1, num_cpus - 1);

    console.log('Master starts with %d processes.', num_processes);
    for (var i = 0; i < num_processes; i++) {
        cluster.fork();
    }
    // Listen for dying processes
    cluster.on('exit', function (worker, code, signal) {
        console.log('A process(pid=%s) of master died (%s). Restarting...', worker.process.pid, signal || code);
        cluster.fork();
    });
    return;
}*/
app.set('port', process.env.PORT || 5050);

var server = app.listen(app.get('port'), function() {
    logger.info('Express server listening on port ' + server.address().port);
});
