"use strict";

const request = require('request');
const config = require('config');
const { STATUS_LIGHTS, StatusEntry } = require('./common.js');
const { loggers } = require('winston');

const logger = loggers.get('appLogger');

let myconfig = config.get('TrafficLight.checkConfig');
let updateList;

const options = {
    rejectUnauthorized: false,
    url: myconfig.grafana.protocol + "://"+ myconfig.grafana.host + myconfig.grafana.path,
    headers: {
        'User-Agent': 'request',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+myconfig.grafana.token
    }
};

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - Grafana (Enabled: '+myconfig.grafana.enable+')');
    updateList = callbackFunction;
};

exports.checkStatus = function() {
    if (myconfig.grafana.enable) {
        request(options, callback);
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
        //logger.debug(body)
        const json = JSON.parse(body);
        updateStatusFromGrafana(json);
    } else {
        logger.error('Error: ',error.toString()) // Print the google web page.
    }
}

function updateStatusFromGrafana(json) {
    //logger.debug('JSON: ',json);
    for(let alert in json){
        if (json.hasOwnProperty(alert)) {
            let id = Number(json[alert].id);
            let state = 0;
            switch (json[alert].state) {
                case 'alerting':
                    state = STATUS_LIGHTS.get(myconfig.grafana.alertLight);
                    break;
                case 'no_data':
                    state = STATUS_LIGHTS.YELLOW;
                    break;
                case 'ok':
                    state = STATUS_LIGHTS.GREEN;
                    break;
            }
            updateList(new StatusEntry(id, 'Grafana Alert', json[alert].dashboardSlug, json[alert].name, state.value), 0);
        }
    }
}



