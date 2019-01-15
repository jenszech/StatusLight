"use strict"

const config = require('config');
const huejay = require('huejay');
const { loggers } = require('winston');

const logger = loggers.get('appLogger');

var configFile = 'config/philips-hue.json';
var myconfig = config.get('TrafficLight.reportConfig.hueLight');

var LightEntry = function(id, on, hue, brightness, saturation) {
    this.id = id;
    this.on = on;
    this.hue = hue;
    this.brightness = brightness;
    this.saturation = saturation;
};

var enabled = myconfig.lightsEnabled;
var lightsBevor = [];
var client;

exports.initReport = function() {
    logger.info('=> Init report - Hue (Enabled: '+enabled+')');

    // Check bridge configuration
    if (enabled &&!myconfig.bridgeUrl) {
        hueHelpFindBridge();
        if (enabled) logger.info ("  - No bridge configurate => disabled hue reporter");
        enabled = false;
    }

    // Check user configuration and create new user
    if (enabled && !myconfig.username) {
        client = new huejay.Client({
            host: myconfig.bridgeUrl
        });
        hueHelperCreateUser();
        logger.info ("  - No username configurate => disabled hue reporter");
        enabled = false;
    }

    if (enabled) {
        client = new huejay.Client({
            host: myconfig.bridgeUrl,
            username: myconfig.username
        });
        huewHelperAuthenticate();
    }

    if (enabled && (!myconfig.lightIds || (myconfig.lightIds.length == 0))) {
        hueHelperPrintLights();
        logger.info ("  - No lights configurate => disabled hue reporter");
        enabled = false;
    }
}

exports.reportStatusChange = function(changedAlarm, oldStatus, newStatus, alertList) {
    if (enabled && (oldStatus.value != newStatus.value)) {
        logger.debug(`Hue - State change: ${oldStatus.value} != ${newStatus.value}`);
        //Save light state bevor alarm
        if ((oldStatus.value <= 1) && (newStatus.value > 1)) {
            logger.debug("Hue - new Alarm: "+newStatus.value );
            lightsBevor.length = 0;
            for (var i in myconfig.lightIds ) {
                storeLight(myconfig.lightIds[i]);
            }
        }
        //Set actual Alarmcolor
        if (newStatus.value > 1) {
            logger.debug("Hue - set Light: "+newStatus.value );
            for (var i in myconfig.lightIds ) {
                setLight(myconfig.lightIds[i], new LightEntry(myconfig.lightIds[i], true, getLightColor(newStatus), 248, 248));
            }
        }
        //Restore lights
        if ((oldStatus.value > 1) && (newStatus.value <= 1)) {
            logger.debug("Hue - back: "+newStatus.value );
            restoreLight();
        }

    }
}

function storeLight(id) {
    client.lights.getById(id)
        .then(light => {
            lightsBevor.push(new LightEntry(light.id, light.on, light.hue, light.brightness, light.saturation));
        })
        .catch(error => {
            logger.error('Could not find light');
            logger.error(error.stack);
        });
}

function setLight(id, newLight) {
    //debugPrintLights();
    if (enabled) {
        client.lights.getById(id)
            .then(light => {
                light.brightness = newLight.brightness;
                light.hue = newLight.hue;
                light.saturation = newLight.saturation;
                light.on = newLight.on;
                return client.lights.save(light);
            })
            .then(light => {
                logger.debug(`Updated light [${light.id}]`);
            })
            .catch(error => {
                logger.error('Something went wrong');
                logger.error(error.stack);
            });
    }
}

function restoreLight() {
    //debugPrintLight();
    for (var i in lightsBevor) {
        setLight(lightsBevor[i].id, lightsBevor[i]);
    }
}

function getLightColor(status) {
    switch(status.value) {
        case 1:
            return 32000
            break;
        case 2:
            return 7350
            break;
        case 3:
            return 64000
            break;

        default:
            return 0
    }
}


// Helper functions ######################################################################################
function hueHelpFindBridge() {
    huejay.discover()
        .then(bridges => {
            for (let bridge of bridges) {
                logger.info(`  - Philips HUE found - Id: ${bridge.id}, IP: ${bridge.ip}`);
                logger.info(`  - Insert config: \"bridgeUrl\": "${bridge.ip}"`);
            }
        })
        .catch(error => {
            logger.error(`An error occurred: ${error.message}`);
        });
}

function hueHelperCreateUser() {
    let user = new client.users.User;
    user.deviceType = 'huejay'; // Default is 'huejay'

    client.users.create(user)
        .then(user => {
            logger.info(`  - New user created - Username: ${user.username}`);
            logger.info(`  - Insert config: \"username\": "${user.username}"`);
        })
        .catch(error => {
            if (error instanceof huejay.Error && error.type === 101) {
                return logger.error(`  - Press Link button on Philips Hue base station bevor next service start to link and create user ...`);
            }

            logger.error(error.stack);
        });
}

function huewHelperAuthenticate() {
    client.bridge.isAuthenticated()
        .then(() => {
            logger.debug('  - Successful authentication on Philips Hue');
        })
        .catch(error => {
            logger.error('  - Could not authenticate on Philips Hue => disabled hue reporter');
            enabled = false;
        });
}

function hueHelperPrintLights() {
    client.lights.getAll()
        .then(lights => {
            for (let light of lights) {
                console.log(`Light [${light.id}]: ${light.name}`);
                console.log(`  Type:             ${light.type}`);
                console.log(`  Unique ID:        ${light.uniqueId}`);
                console.log(`  Model Id:         ${light.modelId}`);
                console.log('  Model:');
                console.log(`    Id:             ${light.model.id}`);
                console.log(`    Name:           ${light.model.name}`);
                console.log(`    Type:           ${light.model.type}`);
                console.log(`    Color Gamut:    ${light.model.colorGamut}`);
            }
        });
}

// Debug functions ######################################################################################
function debugPrintBridge() {
    client.bridge.get()
        .then(bridge => {
            console.log(`Retrieved bridge ${bridge.name}`);
            console.log('  Id:', bridge.id);
            console.log('  Model Id:', bridge.modelId);
            console.log('  Model Name:', bridge.model.name);
        });
}

function debugPrintUser() {
    client.users.getAll()
        .then(users => {
            for (let user of users) {
                console.log(`Username: ${user.username}`);
            }
        });
}

function debugPrintLights() {
    client.lights.getAll()
        .then(lights => {
            for (let light of lights) {
                console.log(`Light [${light.id}]: ${light.name}`);
                console.log(`  Type:             ${light.type}`);
                console.log(`  Unique ID:        ${light.uniqueId}`);
                console.log(`  Model Id:         ${light.modelId}`);
                console.log('  Model:');
                console.log(`    Id:             ${light.model.id}`);
                console.log(`    Name:           ${light.model.name}`);
                console.log(`    Type:           ${light.model.type}`);
                console.log(`    Color Gamut:    ${light.model.colorGamut}`);
                console.log('  State:');
                console.log(`    On:         ${light.on}`);
                console.log(`    Reachable:  ${light.reachable}`);
                console.log(`    Brightness: ${light.brightness}`);
                console.log(`    Color mode: ${light.colorMode}`);
                console.log(`    Hue:        ${light.hue}`);
                console.log(`    Saturation: ${light.saturation}`);
                console.log(`    X/Y:        ${light.xy[0]}, ${light.xy[1]}`);
                console.log(`    Color Temp: ${light.colorTemp}`);
                console.log(`    Alert:      ${light.alert}`);
                console.log(`    Effect:     ${light.effect}`);
                console.log();
            }
        });
}