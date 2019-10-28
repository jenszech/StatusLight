"use strict"

const runner = require('./runCommand');
const config = require('config');
const { loggers } = require('winston');
const logger = loggers.get('appLogger');

var soundplayer = require("sound-player")
var path = require('path');
var myconfig = config.get('TrafficLight.reportConfig.soundPlayer');
var options = {
    filename: "/Users/j.zech/Documents/GIT-Repos/StatusLight/public/sound/trex.mp3",
    gain: 100,
    debug: true,
    player: "afplay",   // other supported players are 'aplay', 'mpg123', 'mpg321'
    device: "plughw0:0"
}
var player = new soundplayer(options);

exports.initReport = function() {
    logger.info('=> Init report - SoundPlayer (Enabled: '+myconfig.enable+')');
}

exports.reportStatusChange = function(changedTicket) {
    if (myconfig.enable) {
        if (changedTicket.isFinished()) {
            var filename = path.resolve('./public/sound/trex.mp3');
            logger.debug(filename);
            player.options.filename = filename;
            player.play();
        } else {
            var filename = path.resolve('./public/sound/party_horn.mp3');
            logger.debug(filename);
            player.options.filename = filename;
            player.play();
        }
    }
}