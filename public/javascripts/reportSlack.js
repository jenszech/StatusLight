var Slack = require('slack-node');
var config = require('config');

const { loggers } = require('winston')
const logger = loggers.get('appLogger');
const myconfig = config.get('TrafficLight.reportConfig.slack');
var updateList;

var SlackAttachment = function(color, title, text) {
    this.color = color;
    this.title = title;
    this.text = text;
};

exports.reportStatusChange = function(oldStatus, newStatus, alertList) {
    checkStatus(oldStatus, newStatus, alertList)
}

function checkStatus(oldStatus, newStatus, alertList) {
    if (myconfig.enable) {
        slack = new Slack();
        slack.setWebhook(myconfig.webhook);

        slack.webhook({
            channel: myconfig.channel,
            username: myconfig.username,
            text: "Monitoring status changed from " + oldStatus.key + " to " + newStatus.key,
            attachments: getAlertAttachments(alertList)
        }, function(error, response) {
            if (error != null) {
                logger.error('Error: ', error);
            }
            if (response.statusCode != 200) {
                logger.debug("Slack response stauts: "+response.status);
            }
        });
    }
}

function getAlertAttachments(alertList) {
    result = [];
    if (alertList.length > 0) {
        for (var i in alertList) {
            result.push( new SlackAttachment(
                getHtmlColor(alertList[i]),
                '[' + getStringStatus(alertList[i]) + '] ' + alertList[i].Typ,
                alertList[i].Name
                )
            )
        }
    }
    logger.debug(result);
    return result;
}

function getHtmlColor(status) {
    switch(status.Status.value) {
        case 1:
            return '#2ecc71'
            break;
        case 2:
            return '#f1c40f'
            break;
        case 3:
            return '#c0392b'
            break;

        default:
            return '#d5f5e3'
    }
}

function getStringStatus(status) {
    switch(status.Status.value) {
        case 1:
            return 'OK'
            break;
        case 2:
            return 'Warning'
            break;
        case 3:
            return 'Alert'
            break;

        default:
            return ''
    }
}
