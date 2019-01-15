"use strict"

const runner = require('./runCommand');
const config = require('config');
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var myconfig = config.get('TrafficLight.reportConfig.trafficLight');

exports.initReport = function() {
    logger.info('=> Init report - TrafficLight (Enabled: '+myconfig.lightsEnabled+')');
    setOn(1,1,1); //green, yellow, red
}

exports.reportStatusChange = function(changedAlarm, oldStatus, newStatus, alertList) {
    if (oldStatus.value != newStatus.value) {
        let light = newStatus.value;
        setOn(light == 1 ? 1 : 0, light == 2 ? 1 : 0, light == 3 ? 1 : 0)
    }
}

function setOn(green, yellow, red) {
    if (myconfig.lightsEnabled) runner.runTrafficLight(myconfig.lightId, green, yellow, red);
}
