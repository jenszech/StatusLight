"use strict"

const execRunner = require('child_process').exec;
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var cmdls = 'ls -l';
var cmdcleware = 'sudo clewarecontrol -c 1';

exports.runLs = function() {
    //console.log('ls2');
    execRunner(cmdls, (error, stdout, stderr) => {
        logger.debug(`${stdout}`);
        logger.error(`${stderr}`);
        if (error !== null) {
            logger.error(`exec error: ${error}`);
        }
    });
}

exports.runTrafficLight = function(id, green, yellow, red) {
    var cmd = cmdcleware + ' -d '+ id + ' -as 0 ' + red + ' -as 1 ' + yellow +' -as 2 ' + green + ' 2>&1';
    logger.debug('RUN: '+cmd);

    execRunner(cmd, (error, stdout, stderr) => {
        logger.debug(`${stdout}`);
        logger.error(`${stderr}`);
        if (error !== null) {
            logger.error(`exec error: ${error}`);
        }
    });
}