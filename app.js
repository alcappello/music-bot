#!/usr/bin/env node
'use strict';

// Module dependencies
let server = require('./dist/server');
let debug = require('debug')('music-api:server');
let http = require('http');
let dotenv = require('dotenv');

// Load the environment file
dotenv.config();

// Create http server
let app = server.Server.bootstrap().app;
let httpPort = normalizePort(process.env.NODE_PORT || '3000');
app.set('port', httpPort);
let httpServer = http.createServer(app);

// Listen on provided ports
httpServer.listen(httpPort);

// Add error handler
httpServer.on('error', onError);

// Start listening on port
httpServer.on('listening', onListening);




/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof httpPort === 'string' ? 'Pipe ' + httpPort : 'Port ' + httpPort;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let addr = httpServer.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}