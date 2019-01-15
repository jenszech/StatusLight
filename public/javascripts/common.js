"use strict"

var Enum = require('enum');

var STATUS_LIGHTS = new Enum({
    'GRAY':0,
    'GREEN': 1,
    'YELLOW':2,
    'RED':3
});

module.exports = {
    STATUS_LIGHTS
};