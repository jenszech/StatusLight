var express = require('express');
var statusMgr = require('../public/javascripts/statusManager');
var dateFormat = require('dateformat');
var router = express.Router();
var config = require('config');

const myconfig = config.get('TrafficLight.reportConfig.statusHtml');

const { loggers } = require('winston')
const logger = loggers.get('appLogger');

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