var request = require('request');
var hash = require('string-hash');
var config = require('config');

const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston')
const logger = loggers.get('appLogger');
const myconfig = config.get('TrafficLight.checkConfig');

var updateList;

exports.setUpdateCallback = function(callbackFunction) {
    updateList = callbackFunction;
}

exports.checkStatus = function() {
    if (myconfig.jenkins.enable) {
        for (i in myconfig.jenkins.jobs) {
            checkStatus(myconfig.jenkins.jobs[i]);
        }
    }
}

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
    if (!error && response.statusCode == 200) {
        //logger.debug(body)
        const json = JSON.parse(body);
        updateStatusFromJenkins(json);
    } else {
        logger.error('Error: ',error.message)
    }
}

function updateStatusFromJenkins(json) {
    //console.log('JSON: ',json);
    var id = hash(json.fullName);
    var state = 0;
    switch (json.color) {
        case 'red': state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
        case 'yellow': state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
        case 'blue': state = STATUS_LIGHTS.GREEN;
        case 'red_anime': state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
        case 'yellow_anime': state = STATUS_LIGHTS.get(myconfig.jenkins.alertLight);
        case 'blue_anime': state = STATUS_LIGHTS.GREEN;
    }
    //Call Statuslist Callback
    updateList(id, myconfig.jenkins.url, 'Jenkins Build', json.name, json.name, state, 0);
}





