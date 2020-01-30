"use strict"

const config = require('config');
const os = require('os');
const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var myconfig = config.get('TrafficLight.checkConfig');
var updateList;
var localState = STATUS_LIGHTS.GRAY;

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - manuel (Enabled: '+myconfig.local.enable+')');
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
    updateList(1, 'Lokal', 'manuel', 'Manueller Alarm', localState, 0);
}





