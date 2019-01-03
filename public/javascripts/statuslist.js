
var express = require('express');
var dateFormat = require('dateformat');
const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston')
const logger = loggers.get('appLogger');

var statusList = [];
var updateLightCallback;

var StatusEntry = function(stype, id, sgroup, sname, status) {
    this.Typ = stype;
    this.Id = id;
    this.Group = sgroup;
    this.Name = sname;
    this.Status = STATUS_LIGHTS.get(status);
    this.UpdateDate = Date.now();
    this.UpdateDateStr = dateFormat(this.UpdateDate, 'dd.mm.yyyy HH:MM');
    this.Disabled = false;
};

/*
 * Init status list
 */
exports.init = function() {
    logger.debug(' Statuslist initialisiert');
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

exports.updateList = function(stype, sId, sgroup, sname, sstatus) {
    var newStatus = new StatusEntry(stype, sId, sgroup, sname, sstatus);
    update(newStatus);
}

exports.getGesamtStatus = function() {
    var status = STATUS_LIGHTS.GRAY;
    for (var i in statusList) {
        if ((statusList[i].Disabled != true) && (statusList[i].Status.value > status.value)) {
            status = statusList[i].Status;
        }
    }
    return status;
}

exports.getAlerts = function() {
    var result = [];
    for (var i in statusList) {
        if ((statusList[i].Disabled != true) && (statusList[i].Status.value > STATUS_LIGHTS.GREEN.value)) {
            result.push(statusList[i]);
        }
    }
    return result;
}

function update(newStatus) {
    var found = false;
    for (var i in statusList) {
        if ((statusList[i].Typ == newStatus.Typ) && (statusList[i].Id == newStatus.Id)) {
            if (statusList[i].Status.value != newStatus.Status.value) {
                logger.info("Status change: " + statusList[i].Status.key + " - " + statusList[i].Typ + ":" + statusList[i].Name);
                if (statusList[i].Disabled == true) {
                    statusList[i].Disabled = false;
                    logger.debug(' Reenabled');
                }
            }
            statusList[i].Status = newStatus.Status;
            statusList[i].UpdateDate = Date.now();
            statusList[i].UpdateDateStr = dateFormat(statusList[i].UpdateDate, 'yyyy-mm-dd HH:MM');
            found = true;
            break; //Stop this loop, we found it!
        }
    }
    if (!found) {
        statusList.push(newStatus);
    }
    updateLightCallback();
}
