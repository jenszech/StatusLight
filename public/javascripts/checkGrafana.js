var request = require('request');
var config = require('config');

const { STATUS_LIGHTS } = require('./common.js');
const { loggers } = require('winston')
const logger = loggers.get('appLogger');
const myconfig = config.get('TrafficLight.checkConfig');

var updateList;
const options = {
    rejectUnauthorized: false,
    url: myconfig.grafana.url,
    headers: {
        'User-Agent': 'request',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+myconfig.grafana.token
    }
};

exports.setUpdateCallback = function(callbackFunction) {
    updateList = callbackFunction;
}

exports.checkStatus = function() {
    if (myconfig.grafana.enable) {
        request(options, callback);
    }
}

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        //logger.debug(body)
        const json = JSON.parse(body);
        updateStatusFromGrafana(json);
    } else {
        logger.error('Error: ',error.toString()) // Print the google web page.
    }
}

function updateStatusFromGrafana(json) {
    //logger.debug('JSON: ',json);
    for(var alert in json){
        var id = Number(json[alert].id);
        var state = 0;
        switch (json[alert].state) {
            case 'alerting': state = STATUS_LIGHTS.get(myconfig.grafana.alertLight);
            case 'no_data': state = STATUS_LIGHTS.YELLOW;
            case 'ok': state = STATUS_LIGHTS.GREEN;
        }
        updateList('Grafana Alert', id, json[alert].dashboardSlug, json[alert].name, state);
    }
}



