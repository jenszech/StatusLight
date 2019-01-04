
var express = require('express');
var dateFormat = require('dateformat');
const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston')
const logger = loggers.get('appLogger');

var statusList = [];
var updateLightCallback;

var StatusEntry = function(id, shost, stype, sgroup, sname, status) {
    this.Id = id;
    this.host = shost;
    this.Typ = stype;
    this.Group = sgroup;
    this.Name = sname;
    this.Status = STATUS_LIGHTS.get(status);
    this.UpdateDate = Date.now();
    this.UpdateDateStr = dateFormat(this.UpdateDate, 'dd.mm.yyyy HH:MM');
    this.LastAlarmChange = Date.now();
    this.LastAlarmChangeStr = dateFormat(this.LastAlarmChange, 'dd.mm.yyyy HH:MM');
    this.DelayAlarm = 0;
    this.Disabled = false;
};

/*
 * Init status list
 */
exports.init = function() {
    logger.debug('Statuslist initialisiert');
}

exports.setUpdateCallback = function(callbackFunction) {
    updateLightCallback = callbackFunction;
}

exports.getList = function() {
    return statusList;
}

exports.setDisable = function(checkId, isDisabled) {
    for (var i in statusList) {
        if (statusList[i].Id == checkId) {
            statusList[i].Disabled = isDisabled;
            logger.debug(' Set Disabled Check: ' +checkId+ ' to ' +isDisabled);
            break; //Stop this loop, we found it!
        }
    }
}

exports.updateList = function(sId, shost, stype, sgroup, sname, sstatus, delay) {
    var newStatus = new StatusEntry(sId, shost, stype, sgroup, sname, sstatus);
    newStatus.DelayAlarm = delay;
    update(newStatus);
}

exports.getGesamtStatus = function() {
    var status = STATUS_LIGHTS.GRAY;
    for (var i in statusList) {
        if ((statusList[i].Disabled != true) && (statusList[i].Status.value > status.value)) {
            //logger.debug(statusList[i].Typ + " : "+ statusList[i].LastAlarmChange + " + " + statusList[i].DelayAlarm + " <= " +Date.now());
            if ((statusList[i].Status.value <= 1) || (statusList[i].LastAlarmChange + statusList[i].DelayAlarm*1000 <= Date.now())) {
                status = statusList[i].Status;
            }
        }
    }
    return status;
}

exports.getAlerts = function() {
    var result = [];
    for (var i in statusList) {
        if ((statusList[i].Disabled != true) && (statusList[i].Status.value > STATUS_LIGHTS.GREEN.value)) {
            if (statusList[i].LastAlarmChange + statusList[i].DelayAlarm*1000 <= Date.now()) {
                result.push(statusList[i]);
            }
        }
    }
    return result;
}

function setState(status, newStatus) {
    if (status.Status.value != newStatus.Status.value) {
        logger.info("Status change: " + status.Status.key + " - " + status.Typ + ":" + status.Name);
        if (status.Disabled == true) {
            status.Disabled = false;
            logger.debug(' Reenabled');
        }
        if ((newStatus.Status.value > 1) && (status.Status.value <= 1)) {
            status.LastAlarmChange = Date.now();
            status.LastAlarmChangeStr = dateFormat(statusList[i].LastAlarmChange, 'dd.mm.yyyy HH:MM');
        } else if ((newStatus.Status.value <= 1)) {
            status.LastAlarmChange = Date.now();
            status.LastAlarmChangeStr = dateFormat(statusList[i].LastAlarmChange, 'dd.mm.yyyy HH:MM');
        }
    }
    status.Status = newStatus.Status;
}

function update(newStatus) {
    var found = false;
    for (var i in statusList) {
        if ((statusList[i].Typ == newStatus.Typ) && (statusList[i].Id == newStatus.Id)) {
            setState(statusList[i], newStatus)
            statusList[i].UpdateDate = Date.now();
            statusList[i].UpdateDateStr = dateFormat(statusList[i].UpdateDate, 'yyyy-mm-dd HH:MM');
            found = true;
            break; //Stop this loop, we found it!
        }
    }
    if (!found) {
        statusList.push(newStatus);
    }
    updateLightCallback(newStatus);
}
