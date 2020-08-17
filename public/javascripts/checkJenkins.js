"use strict";

const request = require('request');
const hash = require('string-hash');
const config = require('config');
const { STATUS_LIGHTS, StatusEntry } = require('./common.js');
const { loggers } = require('winston');

const logger = loggers.get('appLogger');

let myconfig = config.get('TrafficLight.checkConfig');
let updateList;

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - Jenkins (Enabled: '+myconfig.jenkins.enable+')');
    updateList = callbackFunction;
};

exports.checkStatus = function() {
    if (myconfig.jenkins.enable) {
        for (let i in myconfig.jenkins.jobs) {
            if (myconfig.jenkins.jobs.hasOwnProperty(i)) {
                checkStatus(myconfig.jenkins.jobs[i]);
            }
        }
    }
};

function checkStatus(job) {
    const options = {
        rejectUnauthorized: false,
        auth: {
            'user': myconfig.jenkins.user,
            'pass': myconfig.jenkins.password,
        },
        url: myconfig.jenkins.protocol + "://"+ myconfig.jenkins.host + myconfig.jenkins.path +'/'+job+'/api/json?pretty=true',
        headers: {
            'User-Agent': 'request',
            'Cache-Control': 'no-cache',
        }
    };
    request(options, callback);
}

function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
        //logger.debug(body)
        const json = JSON.parse(body);
        updateStatusFromJenkins(json);
    } else {
        logger.error('Error: ',error.message)
    }
}

function updateStatusFromJenkins(json) {
    //console.log('JSON: ',json);
    let id = hash(json.fullName);
    let state;
    switch (json.color) {
        case 'red':
            state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
            break;
        case 'yellow':
            state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
            break;
        case 'blue':
            state = STATUS_LIGHTS.GREEN;
            break;
        case 'red_anime':
            state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
            break;
        case 'yellow_anime':
            state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
            break;
        case 'blue_anime':
            state = STATUS_LIGHTS.GREEN;
            break;
    }
    //Call Statuslist Callback
    updateList(new StatusEntry(id, 'Jenkins Build', json.name, json.name, state.value), 0);
}





