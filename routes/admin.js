"use strict"

var express = require('express');
var router = express.Router();
const statusMgr = require('../public/javascripts/statusManager');
var player = require("../public/javascripts/runSound");
var path = require('path');
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
    if (req.body.action == "playSound") {
        logger.debug('=> playSound');
        if (req.body.actionId == "1") {
            player.playFile(path.resolve('./public/sound/party_horn.mp3'))
        }
        if (req.body.actionId == "2") {
            var file = path.resolve('./public/sound/trex.mp3');
            player.playFile(file);
        }

        res.end('{"success" : "Updated Successfully", "status" : 200}');
    }
});

module.exports = router;
