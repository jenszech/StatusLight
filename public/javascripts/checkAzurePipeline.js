"use strict";

const request = require('request');
const hash = require('string-hash');
const config = require('config');
const { STATUS_LIGHTS, StatusEntry } = require('./common.js');
const { loggers } = require('winston');

const logger = loggers.get('appLogger');

// noinspection JSUnresolvedFunction
let myconfig = config.get('TrafficLight.checkConfig');
let updateList;

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - Azure Pipeline (Enabled: '+myconfig.azurePipeline.enable+')');
    updateList = callbackFunction;
};

exports.setConfig = function(newConfig) {
    myconfig = newConfig;
};

exports.checkStatus = function() {
    if (myconfig.azurePipeline.enable) {
        for (let i in myconfig.azurePipeline.pipelines) {
            if (myconfig.azurePipeline.pipelines.hasOwnProperty(i)) {
                let pipeline = myconfig.azurePipeline.pipelines[i];
                checkStatus(pipeline.definitionId, pipeline.branch);
            }
        }
    }
};

function checkStatus(definitionId, branch) {
    const options = {
        rejectUnauthorized: false,
        auth: {
            'user': 'Basic',
            'pass': myconfig.azurePipeline.apiToken,
        },
        url: "https://"+ myconfig.azurePipeline.host +
            "/"+ myconfig.azurePipeline.organization +
            '/'+ myconfig.azurePipeline.project +
            '/_apis/build/latest/' + definitionId +
            "?api-version=" + myconfig.azurePipeline.apiversion +
            "&branchName=" + branch,
        headers: {
            'User-Agent': 'request',
            'Cache-Control': 'no-cache',
        }
    };

    logger.debug('Request: '+ options.url);
    request(options, callback);
}

function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
        const json = JSON.parse(body);
        module.exports.updateStatusFromAzure(json);
    } else if (!error && response.statusCode === 404) {
        logger.warn('Pipeline not found: ' + response.body)
    } else {
        logger.error('Error: ',error.message)
    }
}

exports.updateStatusFromAzure = function(json) {
    //logger.info(JSON.stringify(json));
    let pipelineName = json.definition.name;
    // noinspection JSUnresolvedVariable
    let branch = json.sourceBranch;
    if (branch.indexOf('refs/heads/') >= 0) {
        branch = branch.substr(11, branch.length);
    }
    let name = pipelineName + " (" +branch +")";
    let id = hash(name);
    let state = STATUS_LIGHTS.GRAY;
    switch (json.result) {
        case 'succeeded':
            state = STATUS_LIGHTS.GREEN;
            break;
        case 'none':
        case 'canceled':
        case 'partiallySucceeded':
            //state = STATUS_LIGHTS.YELLOW;
            break;
        case 'failed':
            state = STATUS_LIGHTS.get(myconfig.azurePipeline.alertLight);
            break;
    }

    //Call Statuslist Callback
    updateList(new StatusEntry(id, 'Azure Pipeline',pipelineName, name, state.value), 0);
};





