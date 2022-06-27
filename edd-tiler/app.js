const logger = require('./logger');
const app = require('./edd_tiler');
const global = require('./global');

const server = app.start();

server.on("error", function (e) {
    if (e.code === "EADDRINUSE") {
        logger.log("Server Error: Port " + global.port + " is already in use, select a different port.", "exception");
    }

    process.exit(1);
});

process.on('uncaughtException', function (err) {
    logger.log('server exception: ' + err.stack, "exception");
});