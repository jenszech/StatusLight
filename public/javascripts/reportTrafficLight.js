var runner = require('./runCommand');
var config = require('config');

const { loggers } = require('winston')
const logger = loggers.get('appLogger');

const myconfig = config.get('TrafficLight.lightManager');
var currentLight = 0;
var debug = !myconfig.lightsEnabled;

exports.initReport = function() {
    logger.debug('Init Light (DebugMode: '+debug+')');
    setOn(1,1,1); //green, yellow, red
}

exports.reportStatusChange = function(changedAlarm, oldStatus, newStatus, alertList) {
    if (oldStatus.value != newStatus.value) {
        light = newStatus.value;
        if (currentLight != light) {
            light == 1 ? 1 : 0
            setOn(light == 1 ? 1 : 0, light == 2 ? 1 : 0, light == 3 ? 1 : 0)
        }
    }
}

function setOn(green, yellow, red) {
    if (!debug) runner.runTrafficLight(green, yellow, red);
}
