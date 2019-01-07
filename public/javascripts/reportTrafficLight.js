var runner = require('./runCommand');
var config = require('config');

const { loggers } = require('winston')
const logger = loggers.get('appLogger');

const myconfig = config.get('TrafficLight.reportConfig.trafficLight');
var currentLight = 0;
var enabled = myconfig.lightsEnabled;

exports.initReport = function() {
    logger.info('=> Init report - TrafficLight (Enabled: '+enabled+')');
    setOn(1,1,1); //green, yellow, red
}

exports.reportStatusChange = function(changedAlarm, oldStatus, newStatus, alertList) {
    if (oldStatus.value != newStatus.value) {
        light = newStatus.value;
        if (currentLight != light) {
            setOn(light == 1 ? 1 : 0, light == 2 ? 1 : 0, light == 3 ? 1 : 0)
        }
    }
}

function setOn(green, yellow, red) {
    if (enabled) runner.runTrafficLight(green, yellow, red);
}
