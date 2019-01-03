var runner = require('./runCommand');
var config = require('config');

const { loggers } = require('winston')
const logger = loggers.get('appLogger');

const myconfig = config.get('TrafficLight.lightManager');
var currentLight = 0;
var debug = !myconfig.lightsEnabled;

exports.initLight = function() {
    logger.debug('Init Light (DebugMode: '+debug+')');
    setOn(1,1,1); //green, yellow, red
}

exports.setLight = function(light) {
    //logger.debug('Check '+ currentLight +' =='+ light);
    if (currentLight != light) {
        logger.debug('Switch light to '+ light);
        light==1?1:0
        setOn(light==1?1:0, light==2?1:0,light==3?1:0)
    }
}

/*
function onOrOffValue(sollColor, ledNumber) {
    if (sollColor == ledNumber) {
        currentLight = sollColor;
        return 1;
    } else {
        return 0;
    }
}
*/

function setOn(green, yellow, red) {
    if (!debug) runner.runTrafficLight(green, yellow, red);
}
