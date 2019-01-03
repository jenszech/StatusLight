var statuslist = require('./statuslist')
const { STATUS_LIGHTS } = require('./common.js');
var checkLocal = require('./checkLocal')
var checkGrafana = require('./checkGrafana')
var checkJenkins = require('./checkJenkins')
var checkDtsmon = require('./checkDtsmon');
var reportSlack = require('./reportSlack');
var lightManager = require('./lightManager');
var pjson = require('../../package.json');
var lastLightState = STATUS_LIGHTS.GRAY;
var config = require('config');

const { loggers } = require('winston')
const logger = loggers.get('appLogger');
const myconfig = config.get('TrafficLight.mainSetting');

exports.init = function() {
    logger.info("StatusAmpel v"+pjson.version + ' ('+myconfig.env+')');
    logger.debug('Debug Logging enabled');
    statuslist.init();
    //Set initial all Lights On
    lightManager.initLight();

    //Register Plugins
    checkLocal.setUpdateCallback(statuslist.updateList);
    checkJenkins.setUpdateCallback(statuslist.updateList);
    checkGrafana.setUpdateCallback(statuslist.updateList);
    checkDtsmon.setUpdateCallback(statuslist.updateList);
    statuslist.setUpdateCallback(updateLight);
}

exports.runIntervallCheck = function() {
    if (myconfig.pollingEnabled) {
        setInterval(function () {
            runChecks('Timer');
        }, myconfig.pollingIntervall * 1000);
    }
}

exports.runSingleCheck = function() {
    runChecks('SingleCheck');
}

exports.getStatusList = function() {
    return statuslist;
}

exports.setLocal = function(lightValue) {
    checkLocal.setLocale(parseInt(lightValue, 10));
}

function runChecks(trigger) {
    checkLocal.checkStatus();
    checkGrafana.checkStatus();
    checkJenkins.checkStatus();
    checkDtsmon.checkStatus();
    logger.info('Check by '+trigger);
}

function updateLight() {
    currentLightState = statuslist.getGesamtStatus();
    if (currentLightState.value != lastLightState.value) {
        logger.info('Change light from '+lastLightState.key + ' to ' + currentLightState.key);
        reportSlack.reportStatusChange(lastLightState, currentLightState, statuslist.getAlerts());
        lastLightState = currentLightState;
        lightManager.setLight(statuslist.getGesamtStatus().value);
    }
}
