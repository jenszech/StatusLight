var statuslist = require('./statuslist')
const { STATUS_LIGHTS } = require('./common.js');
var checkLocal = require('./checkLocal')
var checkGrafana = require('./checkGrafana')
var checkJenkins = require('./checkJenkins')
var checkDtsmon = require('./checkDtsmon');
var reportSlack = require('./reportSlack');
var reportTrafficLight = require('./reportTrafficLight');
var reportHue = require('./reportHUE');
var reportInflux = require('./reportInflux');
var pjson = require('../../package.json');
var lastLightState = STATUS_LIGHTS.GRAY;
var config = require('config');


const { loggers } = require('winston')
const logger = loggers.get('appLogger');
const myconfig = config.get('TrafficLight.mainSetting');

exports.init = function() {
    logger.info("StatusAmpel v"+pjson.version + ' ('+myconfig.env+')');
    logger.info('Init');
    logger.debug('=> Logging (Debug enabled)');
    statuslist.init();

    //Init Reports
    reportSlack.initReport();
    reportTrafficLight.initReport();    //Set initial all Lights On
    reportHue.initReport();
    reportInflux.initReport();

    //Init Checks
    checkLocal.initCheck(statuslist.updateList);
    checkJenkins.initCheck(statuslist.updateList);
    checkGrafana.initCheck(statuslist.updateList);
    checkDtsmon.initCheck(statuslist.updateList);

    //Register Update Callback
    statuslist.setUpdateCallback(changeTrigger);
    logger.info('Init completed');
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
    logger.debug('Check by '+trigger);
}

function runReports(changedAlarm, lastState, currentState, alertList) {
    reportSlack.reportStatusChange(changedAlarm, lastState, currentState, alertList);
    reportTrafficLight.reportStatusChange(changedAlarm, lastState, currentState, alertList);
    reportHue.reportStatusChange(changedAlarm, lastState, currentState, alertList);
    reportInflux.reportStatusChange(changedAlarm, lastState, currentState, alertList);
}

function changeTrigger(changedAlarm) {
    currentLightState = statuslist.getGesamtStatus();
    runReports(changedAlarm, lastLightState, currentLightState, statuslist.getAlerts());
    if (currentLightState.value != lastLightState.value) {
        logger.info('Change light from '+lastLightState.key + ' to ' + currentLightState.key);
        lastLightState = currentLightState;
    }
}

