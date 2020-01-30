"use strict"

const request = require('request');
const hash = require('string-hash');
const cheerio = require('cheerio');
const  config = require('config');
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var myconfig = config.get('TrafficLight.checkConfig.dtsmon');
var updateList;

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - DTSMon (Enabled: '+myconfig.enable+')');
    updateList = callbackFunction;
}

const jsonReponse = [];
const columnHeadings = ["Status", "Server", "Name", "IP", "Group"];

exports.checkStatus = function() {
    checkStatus();

}

function checkStatus() {
    if (myconfig.enable) {
        var url = 'http://localhost:8088/example';
        var headers = {
            'User-Agent': 'request',
            'Cache-Control': 'no-cache',
        };

        var form = {username: myconfig.username, password: myconfig.password, login: "Anmenden", redirect: "index.php"};
        var url = myconfig.url;

        request.post({headers: headers, url: myconfig.url, form: form, method: 'POST'}, function (e, r, body) {
            callbackStatusCheck(e, r, body);
        });
    }
}
function callbackStatusCheck(error, response, body) {
    jsonReponse.length = 0;
    if (!error && response.statusCode == 200) {
            let $ = cheerio.load(body);

        $("#hostlist").each(function(i, table) {
            var trs = $(table).find('tr')
            // Process rows for data
            $(table).find('tr').each(processRow)
        })

        for (var i in jsonReponse) {
            updateStatusDTSMon(jsonReponse[i]);
        }
    } else {
        logger.error('Error: ',error.toString()) // Print the google web page.
    }
}

function processRow(i, row) {
    var rowJson = {}
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
            default:
                break;
        }
    })
    //logger.debug(rowJson);
    // Skip blank rows
    if (JSON.stringify(rowJson) !== '{}') jsonReponse.push(rowJson)
}

function updateStatusDTSMon(json) {
    //console.log('JSON: ',json);
    var id = hash(json.Server);
    var state = 0;
    switch (json.Status) {
        case 'FAILURE': state = myconfig.alertLight; break;
        case 'Keine Verbindung': state = 2; break;
        case 'Ok': state = 1; break;
        case 'MAINTENANCE 1': state = 1; break;
        default: state = myconfig.alertLight;
    }
    //Call Statuslist Callback
    updateList(id, 'DTSMon', json.Group, json.Name, state, myconfig.alarmDelay);
}
