"use strict";
const { STATUS_LIGHTS, StatusEntry, WrongParameterException } = require('./common.js');
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

exports.getStatus = function(id, typ) {
    for (let i in statusList) {
        if (statusList.hasOwnProperty(i) && (statusList[i].Id === id) && (statusList[i].Typ === typ)) {
            return statusList[i];
        }
    }
    return null;
};

exports.setDisable = function(id, typ, isDisabled) {
    let status = this.getStatus(id, typ);
    if (status != null) {
        status.Disabled = isDisabled;
        logger.debug(' Set Disabled Check: ' + id + ' to ' + isDisabled);
    }
};

exports.updateList = function(status, delay) {
    if (!(status instanceof StatusEntry)) {
        throw new WrongParameterException('wrong type: status expecting StatusEntry');
    }
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
    let now = Date.now();
    for (let i in statusList) {
        if (statusList.hasOwnProperty(i) && (statusList[i].Disabled !== true) && (statusList[i].Status.value > STATUS_LIGHTS.GREEN.value)) {
            if (statusList[i].LastAlarmChange + statusList[i].DelayAlarm*1000 <= now) {
                result.push(statusList[i]);
            }
        }
    }
    return result;
};

exports.setState = function(statusEntry, newStatus) {
//function setState(statusEntry, newStatus) {
    if (!(statusEntry instanceof StatusEntry)) {
        throw new WrongParameterException('wrong type: statusEntry expecting StatusEntry');
    }
    if (typeof (newStatus) !== "object") {
        throw new WrongParameterException('wrong type: newStatus expecting Object, found ' + typeof (newStatus));
    }
    if ((newStatus.value < 0) || (newStatus.value >3)){
        throw new WrongParameterException('Status value must between 0 to 3');
    }
    if (statusEntry.Status.value !== newStatus.value) {
        logger.info("Status change: " + statusEntry.Status.key + " - " + statusEntry.Typ + ":" + statusEntry.Name);
        if (statusEntry.Disabled === true) {
            statusEntry.Disabled = false;
            logger.debug(' Reenabled');
        }
        if ((newStatus.value > 1) && (statusEntry.Status.value <= 1)) {
            statusEntry.LastAlarmChange = Date.now();
        } else if ((newStatus.value === 1) && (statusEntry.Status.value !== 1)) {
            statusEntry.LastAlarmChange = Date.now();
        }
        if (newStatus !== STATUS_LIGHTS.GRAY) {
            statusEntry.Status = newStatus;
        }
    }
};

function update(newStatus) {
    let statusEntry =  module.exports.getStatus(newStatus.Id, newStatus.Typ);
    if (statusEntry != null) {
        updateStatus(statusEntry, newStatus.Status);
    } else {
        statusList.push(newStatus);
        statusEntry = newStatus
    }
    notifyStatusUpdate(statusEntry);
}

function updateStatus(statusEntry, newStatus) {
    module.exports.setState(statusEntry, newStatus);
    statusEntry.UpdateDate = Date.now();
}

function notifyStatusUpdate(newStatus) {
    if (typeof updateLightCallback != 'undefined') {
        updateLightCallback(newStatus);
    }
}
