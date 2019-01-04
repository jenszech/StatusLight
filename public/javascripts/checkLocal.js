var config = require('config');

const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston')
const logger = loggers.get('appLogger');
const myconfig = config.get('TrafficLight.checkConfig');

var updateList;
var localState = STATUS_LIGHTS.GRAY;

exports.setUpdateCallback = function(callbackFunction) {
    updateList = callbackFunction;
}

exports.checkStatus = function() {
    if (myconfig.local.enable) {
        updateStatusFromLocale();
    }
}

exports.setLocale = function(lightValue) {
    if (myconfig.local.enable) {
        localState = STATUS_LIGHTS.get(lightValue);
        updateStatusFromLocale();
    }
}


function updateStatusFromLocale() {
    //Call Statuslist Callback
    updateList('Lokal', 1, 'manuel', 'Manueller Alarm', localState, 0);
}





