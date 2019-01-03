var express = require('express');
var statusMgr = require('../public/javascripts/statusManager');
var router = express.Router();

const { loggers } = require('winston')
const logger = loggers.get('appLogger');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'AdminPage' });
});

/* GET status listing. */
router.post('/', function(req, res, next) {
    logger.debug('POST Admin Response');
    if (req.body.action == "setLocale") {
        logger.debug('=> setLocale');
        statusMgr.setLocal(req.body.actionId);
        res.end('{"success" : "Updated Successfully", "status" : 200}');
    }
    if (req.body.action == "triggerReload") {
        logger.debug('=> triggerReload');
        statusMgr.runSingleCheck();
        res.end('{"success" : "Updated Successfully", "status" : 200}');
    }
    if (req.body.action == "pause") {
        logger.debug('=> Pause: '+req.body.actionId);
        statusMgr.getStatusList().setDisable(parseInt(req.body.actionId, 10), true);
        res.end('{"success" : "Updated Successfully", "status" : 200}');
    }
    if (req.body.action == "play") {
        logger.debug(' => Pause: '+req.body.actionId);
        statusMgr.getStatusList().setDisable(parseInt(req.body.actionId, 10), false);
        res.end('{"success" : "Updated Successfully", "status" : 200}');
    }
});

module.exports = router;
