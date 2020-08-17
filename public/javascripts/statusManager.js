"use strict";

const statuslist = require('./statuslist');
const ticketlist = require('./ticketlist');
const { STATUS_LIGHTS } = require('./common.js');
const checkLocal = require('./checkLocal');
const checkGrafana = require('./checkGrafana');
const checkJenkins = require('./checkJenkins');
const checkAzurePipeline = require('./checkAzurePipeline');
const checkDtsmon = require('./checkDtsmon');
const checkJira = require('./checkJira');
const reportSlack = require('./reportSlack');
const reportTrafficLight = require('./reportTrafficLight');
const reportHue = require('./reportHUE');
const reportInflux = require('./reportInflux');
const reportSoundPlayer = require('./reportSoundPlayer');
const pjson = require('../../package.json');
const config = require('config');
const { loggers } = require('winston');

const logger = loggers.get('appLogger');

let lastLightState = STATUS_LIGHTS.GRAY;

let myconfig = config.get('TrafficLight.mainSetting');

exports.init = function() {
    logger.info("StatusAmpel v"+pjson.version + ' ('+myconfig.env+')');
    logger.info('Init');
    logger.debug('=> Logging (Debug enabled)');
    statuslist.init();
    ticketlist.init();

    //Init Reports
    reportSlack.initReport();
    reportTrafficLight.initReport();    //Set initial all Lights On
    reportHue.initReport();
    reportInflux.initReport();
    reportSoundPlayer.initReport();

    //Init Checks
    checkLocal.initCheck(statuslist.updateList);
    checkJenkins.initCheck(statuslist.updateList);
    checkAzurePipeline.initCheck(statuslist.updateList);
    checkGrafana.initCheck(statuslist.updateList);
    checkDtsmon.initCheck(statuslist.updateList);

    checkJira.initCheck(ticketlist.updateList);

    //Register Update Callback
    statuslist.setUpdateCallback(changeAlarmTrigger);
    ticketlist.setUpdateCallback(changeNotifyTrigger);
    logger.info('Init completed');
};

exports.runIntervallCheck = function() {
    if (myconfig.pollingEnabled) {
        setInterval(function () {
            runChecks('Timer');
        }, myconfig.pollingIntervall * 1000);
    }
};

exports.runSingleCheck = function() {
    runChecks('SingleCheck');
};

exports.getStatusList = function() {
    return statuslist;
};

exports.getTicketList = function() {
    return ticketlist;
};

exports.setLocal = function(lightValue) {
    checkLocal.setLocale(parseInt(lightValue, 10));
};

function runChecks(trigger) {
    checkLocal.checkStatus();
    checkGrafana.checkStatus();
    checkJenkins.checkStatus();
    checkAzurePipeline.checkStatus();
    checkDtsmon.checkStatus();
    checkJira.checkStatus();
    logger.debug('Check by '+trigger);
}

function runReports(changedAlarm, lastState, currentState, alertList) {
    reportSlack.reportStatusChange(changedAlarm, lastState, currentState, alertList);
    reportTrafficLight.reportStatusChange(changedAlarm, lastState, currentState, alertList);
    reportHue.reportStatusChange(changedAlarm, lastState, currentState, alertList);
    reportInflux.reportStatusChange(changedAlarm, lastState, currentState, alertList);
}

function changeAlarmTrigger(changedAlarm) {
    let currentLightState = statuslist.getGesamtStatus();
    runReports(changedAlarm, lastLightState, currentLightState, statuslist.getAlerts());
    if (currentLightState.value !== lastLightState.value) {
        logger.info('Change light from '+lastLightState.key + ' to ' + currentLightState.key);
        lastLightState = currentLightState;
    }
}

function changeNotifyTrigger(changedValue) {
    reportSoundPlayer.reportStatusChange(changedValue);
}
