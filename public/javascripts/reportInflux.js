var config = require('config');
const Influx = require('influx');
const { loggers } = require('winston')
const logger = loggers.get('appLogger');
const myconfig = config.get('TrafficLight');
var updateList;


const influx = new Influx.InfluxDB({
    hosts: [{
        host: myconfig.reportConfig.influx.databaseHost,
        port: myconfig.reportConfig.influx.databasePort,
        protocol: myconfig.reportConfig.influx.databaseProtocol,
        options: {
            ca: '*',
            rejectUnauthorized: false
        },
    }],
    username: myconfig.reportConfig.influx.username,
    password: myconfig.reportConfig.influx.password,
    database: myconfig.reportConfig.influx.schema,
    schema: [
        {
            measurement: 'statusmonitor',
            fields: {
                state: Influx.FieldType.INTEGER,
                name: Influx.FieldType.STRING,

            },
            tags: [
                'hostname', 'stage', 'typ', 'role', 'level'
            ]
        }
    ]
})



var InfluxEntry = function(color, title, text) {
    this.color = color;
    this.title = title;
    this.text = text;
};

exports.initReport = function() {
    logger.info('=> Init report - Influx (Enabled: '+myconfig.reportConfig.influx.enable+')');
    if (myconfig.reportConfig.influx.enable) {
        influx.getDatabaseNames()
            .then(names => {
                if (!names.includes(myconfig.reportConfig.influx.schema)) {
                    logger.error("Influx DB didn't exist -> disable Influx !");
                    myconfig.enable = false;
                }
            })
    }
}


exports.reportStatusChange = function(oldStatus, newStatus, alertList) {
    reportStatus(oldStatus, newStatus, alertList)
}

function reportStatus(changedAlarm, lastState, currentState, alertList) {
    if (myconfig.reportConfig.influx.enable) {
        //logger.debug("Influx Export:" +  changedAlarm.Name + ": " + getAlarmValue(changedAlarm));
        influx.writePoints([
            {
                measurement: 'statusmonitor',
                tags: { hostname: changedAlarm.Name, stage: myconfig.mainSetting.env, typ:changedAlarm.Typ , role: changedAlarm.Group, level:getAlarmLevel(changedAlarm)},
                fields: { state: getAlarmValue(changedAlarm), name: changedAlarm.Name },
            }
        ]).catch(err => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })
    }
}




function getAlarmValue(status) {
    switch(status.Status.value) {
        case 2:
            return 1
            break;
        case 3:
            return 1
            break;
        default:
            return 0;
    }
}

function getAlarmLevel(status) {
    switch(status.Status.value) {
        case 2:
            return "Warning"
            break;
        case 3:
            return "Alarm"
            break;
        default:
            return "Ok";
    }
}
