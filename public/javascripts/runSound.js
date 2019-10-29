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
    gain: myconfig.gain,
    debug: true,
    player: myconfig.player,   // other supported players are 'aplay', 'mpg123', 'mpg321'
    device: myconfig.device
}
var player = new soundplayer(options);

exports.playFile = function(filename) {
    logger.debug(filename);
    player.options.filename = filename;
    player.play();
}
