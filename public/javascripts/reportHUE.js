var config = require('config');
let huejay = require('huejay');
const { loggers } = require('winston');
const logger = loggers.get('appLogger');
var configFile = 'config/philips-hue.json';

const myconfig = config.get('TrafficLight.reportConfig.hueLight');

var currentLight = 0;
var enabled = myconfig.lightsEnabled;
var lights = [];
var lightsBevor = [];
var client;

exports.initReport = function() {
    logger.info('=> Init report - Hue (Enabled: '+enabled+')');

    //hue.bridge = myconfig.bridgeUrl;  // from hue.getBridges
    //hue.username = myconfig.username;

    huejay.discover()
        .then(bridges => {
            for (let bridge of bridges) {
                logger.info(`Philips HUE found - Id: ${bridge.id}, IP: ${bridge.ip}`);
            }
        })
        .catch(error => {
           logger.error(`An error occurred: ${error.message}`);
        });

    client = new huejay.Client({
        host:     myconfig.bridgeUrl,
        port:     80,               // Optional
        username: '4-F7YzJkVjYh6Jl3IIdWVz98KwyUcKVQUHjl3jo5', // Optional
//        timeout:  15000,            // Optional, timeout in milliseconds (15000 is the default)
    });

    /*
    client.users.getAll()
        .then(users => {
            for (let user of users) {
                console.log(`Username: ${user.username}`);
            }
        });
*/
    client.bridge.isAuthenticated()
        .then(() => {
            console.log('Successful authentication');
        })
        .catch(error => {
            console.log('Could not authenticate');
        });

    client.bridge.get()
        .then(bridge => {
            console.log(`Retrieved bridge ${bridge.name}`);
            console.log('  Id:', bridge.id);
            console.log('  Model Id:', bridge.modelId);
            console.log('  Model Name:', bridge.model.name);
        });

    client.lights.getById(3)
        .then(light => {
            console.log('Found light:');
            console.log(`  Light [${light.id}]: ${light.name}`);
            lights.push(light);
        })
        .catch(error => {
            console.log('Could not find light');
            console.log(error.stack);
        });
    client.lights.getById(4)
        .then(light => {
            console.log('Found light:');
            console.log(`  Light [${light.id}]: ${light.name}`);
            lights.push(light);
        })
        .catch(error => {
            console.log('Could not find light');
            console.log(error.stack);
        });

    /*
    let user = new client.users.User;
    user.deviceType = 'huejay'; // Default is 'huejay'

    client.users.create(user)
        .then(user => {
            logger.info(`New user created - Username: ${user.username}`);
        })
        .catch(error => {
            if (error instanceof huejay.Error && error.type === 101) {
                return console.log(`Link button not pressed. Try again...`);
            }

            logger.error(error.stack);
        });
*/
}

exports.reportStatusChange = function(changedAlarm, oldStatus, newStatus, alertList) {
    if (oldStatus.value != newStatus.value) {
        logger.debug("Hue - State change");
        //Save light state bevor alarm
        if ((oldStatus.value <= 1) && (newStatus.value > 1)) {
            logger.debug("Hue - new Alarm: "+newStatus.value );
            lightsBevor.length = 0;
            storeLight(3);
            storeLight(4);
        }
        if (newStatus.value > 1) {
            logger.debug("Hue - set Light: "+newStatus.value );
            setLight(lights[0], getLightColor(newStatus));
        }

        //Restore lights
        if ((oldStatus.value > 1) && (newStatus.value <= 1)) {
            logger.debug("Hue - back: "+newStatus.value );
            restoreLight(lightsBevor[0]);
        }

    }
}

function storeLight(id) {
    client.lights.getById(id)
        .then(light => {
            lightsBevor.push(light);
        })
        .catch(error => {
            logger.error('Could not find light');
            logger.error(error.stack);
        });
}

function setLight(light, color) {
    //debugPrintLights();
    if (enabled) {
        light.brightness = 254;
        light.hue = color;
        light.saturation = 254;
        light.on = true;

        client.lights.save(light)
            .then(light => {
                console.log(`Updated light [${light.id}]`);
            })
            .catch(error => {
                console.log('Something went wrong');
                console.log(error.stack);
            });
    }
}

function restoreLight(light) {
    //debugPrintLight();
    if (enabled) {
        client.lights.save(light)
            .then(light => {
                console.log(`Updated light [${light.id}]`);
            })
            .catch(error => {
                console.log('Something went wrong');
                console.log(error.stack);
            });
    }
}

function getLightColor(status) {
    switch(status.value) {
        case 1:
            return 0
            break;
        case 2:
            return 32000
            break;
        case 3:
            return 64000
            break;

        default:
            return 0
    }
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