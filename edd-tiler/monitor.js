'use strict';

const fs = require('fs');
const global = require('./global');
const logger = require('./logger');
const folder = global.monitorFolder;

if(folder === '') {
    logger.error('please specify monitor folder');
    return;
}

const interval = 60000;

function monitor() {
    fs.readdirSync(folder).forEach(file => {
        if(!file.endsWith('.json'))
            return;

        const path = folder + '/' + file;

        if(fs.lstatSync(path).isDirectory())
            return;

        logger.log(path);

        const spawn = require('child_process').spawn;

        const child = spawn(global.node, ['./tiler.js', '--jsonPath=' + path]);

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.on('error', function(err) {

        });

        child.on('exit', function(code) {
            if(code !== 0) {

            }
            else {

            }
        });
    });

    setTimeout(monitor, interval);
}

process.on('uncaughtException', function(err) {
    console.log('exception: ' + err.stack, "exception");
});

monitor();











