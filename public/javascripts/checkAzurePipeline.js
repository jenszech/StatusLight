"use strict"

const request = require('request');
const hash = require('string-hash');
const config = require('config');
const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var myconfig = config.get('TrafficLight.checkConfig');
var updateList;

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - Azure Pipeline (Enabled: '+myconfig.azurePipeline.enable+')');
    updateList = callbackFunction;
}

exports.checkStatus = function() {
    if (myconfig.azurePipeline.enable) {
        checkStatus();
    }
}

function checkStatus() {
    const options = {
        rejectUnauthorized: false,
        auth: {
            'user': 'Basic',
            'pass': myconfig.azurePipeline.apiToken,
        },
        url: "https://"+ myconfig.azurePipeline.host +
            "/"+ myconfig.azurePipeline.organization +
            '/'+ myconfig.azurePipeline.project +
            '/_apis/build/latest/' + myconfig.azurePipeline.definitonName +
            "?api-version=" + myconfig.azurePipeline.apiversion,
        headers: {
            'User-Agent': 'request',
            'Cache-Control': 'no-cache',
        }
    };
    logger.debug('Request: ',options.url);
    request(options, callback);
}

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        //logger.debug(body)
        const json = JSON.parse(body);
        updateStatusFromJenkins(json);
    } else {
        logger.error('Error: ',error.message)
    }
}

function updateStatusFromJenkins(json) {
    logger.debug('JSON: ',json);
    var id = json.definition.name;
    var url = json.definition.url;
    var state = STATUS_LIGHTS.get(myconfig.azurePipeline.alertLight);
    switch (json.result) {
        case 'succeeded':
            state = STATUS_LIGHTS.GREEN;
            break;
    }

    //Call Statuslist Callback
    updateList(id, url, 'Azure Pipeline', myconfig.azurePipeline.definitonName, json.buildNumber, state, 0);
}





