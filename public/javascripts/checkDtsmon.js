"use strict";

const request = require('request');
const hash = require('string-hash');
const cheerio = require('cheerio');
const  config = require('config');
const { loggers } = require('winston');

const logger = loggers.get('appLogger');

let myconfig = config.get('TrafficLight.checkConfig.dtsmon');
let updateList;

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - DTSMon (Enabled: '+myconfig.enable+')');
    updateList = callbackFunction;
};

const jsonReponse = [];
const columnHeadings = ["Status", "Server", "Name", "IP", "Group"];

exports.checkStatus = function() {
    checkStatus();

};

function checkStatus() {
    if (myconfig.enable) {
        let headers = {
            'User-Agent': 'request',
            'Cache-Control': 'no-cache',
        };

        let form = {username: myconfig.username, password: myconfig.password, login: "Anmenden", redirect: "index.php"};

        request.post({headers: headers, url: myconfig.url, form: form, method: 'POST'}, function (e, r, body) {
            callbackStatusCheck(e, r, body);
        });
    }
}
function callbackStatusCheck(error, response, body) {
    jsonReponse.length = 0;
    if (!error && response.statusCode === 200) {
            let $ = cheerio.load(body);

        $("#hostlist").each(function(i, table) {
            //let trs = $(table).find('tr');
            // Process rows for data
            $(table).find('tr').each(processRow)
        });

        for (let i in jsonReponse) {
            if (jsonReponse.hasOwnProperty(i)) {
                updateStatusDTSMon(jsonReponse[i]);
            }
        }
    } else {
        logger.error('Error: ',error.toString()) // Print the google web page.
    }
}

function processRow(i, row) {
    let rowJson = {};
    //logger.debug(row);
    let $ = cheerio.load(row);
    $(row).find('td').each(function(j, cell) {
        //logger.debug(cell);
        switch (j) {
            case 0 :
                rowJson[ columnHeadings[0] ] = cell.children[0].attribs.title;
                break;
            case 3 :
                rowJson[ columnHeadings[1] ] = cell.attribs.title.replace("Hostname: ", "");
                rowJson[ columnHeadings[2] ] = $(cell).find('a')[0].children[0].data;
                rowJson[ columnHeadings[3] ] = $(cell).find('span')[0].children[0].data;
                rowJson[ columnHeadings[4] ] = rowJson[ columnHeadings[1]].split(".")[0].replace(/\d+/g, '');
                break;
            default:
                break;
        }
    });
    //logger.debug(rowJson);
    // Skip blank rows
    if (JSON.stringify(rowJson) !== '{}') jsonReponse.push(rowJson)
}

function updateStatusDTSMon(json) {
    //console.log('JSON: ',json);
    let id = hash(json.Server);
    let state;
    switch (json.Status) {
        case 'FAILURE': state = myconfig.alertLight; break;
        case 'Keine Verbindung': state = 2; break;
        case 'Ok': state = 1; break;
        case 'MAINTENANCE 1': state = 1; break;
        default: state = myconfig.alertLight;
    }
    //Call Statuslist Callback
    updateList(new StatusEntry(id, 'DTSMon', json.Group, json.Name, state), myconfig.alarmDelay);
}
