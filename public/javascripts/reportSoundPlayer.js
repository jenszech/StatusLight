"use strict"

const runner = require('./runCommand');
const config = require('config');
const { loggers } = require('winston');
const logger = loggers.get('appLogger');

var player = require("./runSound");
var path = require('path');
var myconfig = config.get('TrafficLight.reportConfig.soundPlayer');

exports.initReport = function() {
    logger.info('=> Init report - SoundPlayer (Enabled: '+myconfig.enable+')');
}

exports.reportStatusChange = function(changedTicket) {
    if (myconfig.enable) {
        if (changedTicket.isFinished()) {
            player.playFile(path.resolve('./public/sound/'+myconfig.finishFile))
        } else {
            player.playFile(path.resolve('./public/sound/'.changeFile))
        }
    }
}
