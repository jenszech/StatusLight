"use strict";

const config = require('config');
const { STATUS_LIGHTS, StatusEntry } = require('./common.js');
const { loggers } = require('winston');

const logger = loggers.get('appLogger');

let myconfig = config.get('TrafficLight.checkConfig');
let updateList;
let localState = STATUS_LIGHTS.GRAY;

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - manuel (Enabled: '+myconfig.local.enable+')');
    updateList = callbackFunction;
};

exports.checkStatus = function() {
    if (myconfig.local.enable) {
        updateStatusFromLocale();
    }
};

exports.setLocale = function(lightValue) {
    if (myconfig.local.enable) {
        localState = STATUS_LIGHTS.get(lightValue);
        updateStatusFromLocale();
    }
};


function updateStatusFromLocale() {
    //Call Statuslist Callback
    updateList(new StatusEntry(1, "Lokal", "manuel", "Manueller Alarm", localState.value), 0);
}





