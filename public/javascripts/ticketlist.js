"use strict";

const { loggers } = require('winston');

const logger = loggers.get('appLogger');

let ticketList = [];
let updateAudioCallback;


/*
 * Init status list
 */
exports.init = function() {
    logger.info('=> Ticketlist initialisiert');
};

exports.setUpdateCallback = function(callbackFunction) {
    updateAudioCallback = callbackFunction;
};

exports.getList = function() {
    return ticketList;
};

exports.updateList = function(newTicket) {
    update(newTicket);
};

function update(newTicket) {
    let found = false;
    for (let i in ticketList) {
        if (ticketList.hasOwnProperty(i) && (ticketList[i].Id === newTicket.Id)) {
            setState(ticketList[i],newTicket);
            ticketList[i].UpdateDate = Date.now();
            found = true;
            break; //Stop this loop, we found it!
        }
    }
    if (!found) {
        ticketList.push(newTicket);
    }
}

function setState(oldTicket, newTicket) {
    if (oldTicket.Status !== newTicket.Status) {
        logger.info("Ticket Status change: " + newTicket.Status + " - " + newTicket.Typ + ":" + newTicket.Name);
        oldTicket.Status = newTicket.Status;
        //if (!oldTicket.isFinished() && newTicket.isFinished()) {
            updateAudioCallback(newTicket);
        //}

    }
}