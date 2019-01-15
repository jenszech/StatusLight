"use strict"

var express = require('express');
var router = express.Router();
const config = require('config');
const dateFormat = require('dateformat');
const statusMgr = require('../public/javascripts/statusManager');
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var myconfig = config.get('TrafficLight.reportConfig.statusHtml');


/* GET status listing. */
router.get('/', function(req, res, next) {
    renderList(res);
});

function renderList(res){
    var statuslist = statusMgr.getStatusList();
    var now = dateFormat(Date.now(), 'dd.mm.yyyy HH:MM:ss');

    res.render('status', {'statusList':statuslist.getList(), 'title':'Status', 'overallStatus':statuslist.getGesamtStatus(), 'reloadTime':now, 'config':myconfig});
}

module.exports = router;