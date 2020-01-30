"use strict";
const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston');
const logger = loggers.get('appLogger');

let statusList = [];
let updateLightCallback;

/*
 * Init status list
 */
exports.init = function() {
    statusList = [];
    logger.info('=> Statuslist initialisiert');
};

exports.setUpdateCallback = function(callbackFunction) {
    updateLightCallback = callbackFunction;
};

exports.getList = function() {
    return statusList;
};

exports.getStatus = function(id) {
    for (let i in statusList) {
        if (statusList.hasOwnProperty(i) && (statusList[i].Id === id)) {
            return statusList[i];
        }
    }
    return null;
};

exports.setDisable = function(id, isDisabled) {
    let status = this.getStatus(id);
    if (status != null) {
        status.Disabled = isDisabled;
        logger.debug(' Set Disabled Check: ' + id + ' to ' + isDisabled);
    }
};

exports.updateList = function(status, delay) {
    status.DelayAlarm = delay;
    update(status);
};

exports.getGesamtStatus = function() {
    let status = STATUS_LIGHTS.GRAY;
    for (let i in statusList) {
        if (statusList.hasOwnProperty(i) && (statusList[i].Disabled !== true) && (statusList[i].Status.value > status.value)) {
            if ((statusList[i].Status.value <= 1) || (statusList[i].LastAlarmChange + statusList[i].DelayAlarm*1000 <= Date.now())) {
                status = statusList[i].Status;
            }
        }
    }
    return status;
};

exports.getAlerts = function() {
    let result = [];
    for (let i in statusList) {
        if (statusList.hasOwnProperty(i) && (statusList[i].Disabled !== true) && (statusList[i].Status.value > STATUS_LIGHTS.GREEN.value)) {
            if (statusList[i].LastAlarmChange + statusList[i].DelayAlarm*1000 <= Date.now()) {
                result.push(statusList[i]);
            }
        }
    }
    return result;
};

function setState(status, newStatus) {
    if (status.Status.value !== newStatus.Status.value) {
        logger.info("Status change: " + status.Status.key + " - " + status.Typ + ":" + status.Name);
        if (status.Disabled === true) {
            status.Disabled = false;
            logger.debug(' Reenabled');
        }
        if ((newStatus.Status.value > 1) && (status.Status.value <= 1)) {
            status.LastAlarmChange = Date.now();
        } else if ((newStatus.Status.value <= 1)) {
            status.LastAlarmChange = Date.now();
        }
    }
    status.Status = newStatus.Status;
}

function update(newStatus) {
    let found = false;
    for (let i in statusList) {
        if (statusList.hasOwnProperty(i) && (statusList[i].Typ === newStatus.Typ) && (statusList[i].Id === newStatus.Id)) {
            setState(statusList[i], newStatus);
            statusList[i].UpdateDate = Date.now();
            found = true;
            break; //Stop this loop, we found it!
        }
    }
    if (!found) {
        statusList.push(newStatus);
    }

    if (typeof updateLightCallback != 'undefined') {
        updateLightCallback(newStatus);
    }
}
