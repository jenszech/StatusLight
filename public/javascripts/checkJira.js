"use strict";

const { SprintEntry, TicketEntry } = require('./common');
const config = require('config');
const { loggers } = require('winston');
let jiraClient = require('jira-connector');

const logger = loggers.get('appLogger');

let myconfig = config.get('TrafficLight.checkConfig');
let updateList;
let jira;

const options = {
    host: myconfig.jira.host,
    basic_auth: {
        username: myconfig.jira.user,
        password: myconfig.jira.password
    },
    strictSSL: myconfig.jira.strictSSL // One of optional parameters
};

exports.initCheck = function(callbackFunction) {
    logger.info('=> Init checks - Jira (Enabled: '+myconfig.jira.enable+')');
    jira = new jiraClient(options);
    updateList = callbackFunction;
};

exports.checkStatus = function() {
    if (myconfig.jira.enable) {
        getActiveSprints(myconfig.jira.SprintBoardId);
    }
};

// Jira Client
function getActiveSprints(boardId) {
    logger.debug('Call: Jira - getAllSprints');
    jira.board.getAllSprints( {
        boardId: boardId,
        state: 'active'
    }, getActiveSprintsCallback);
}

function getActiveSprintsCallback(error, sprints) {
    if (!error) {
        logger.debug('Call: Jira - getAllSprints - Callback');
        if (sprints.values.length > 0) {
            for (let i=0; i<sprints.values.length; i++) {
                let sprint = sprints.values[i];
                let newSprint = createSprint(sprint);
                getTicketsInSprint(newSprint);
            }
        }
    } else {
        logger.error('Error: ',error.toString()) // Print the google web page.
    }
}

function getTicketsInSprint(sprint) {
    //logger.debug('Call: Jira - getIssuesForSprint');
    jira.board.getIssuesForSprint({
            boardId: '1783',
            sprintId: sprint.Id
        },
        function (error, issues) {
            if (!error) {
                logger.debug('Call: Jira - getIssuesForSprint - Callback');
                if (issues.issues.length > 0) {
                    for (let i = 0; i < issues.issues.length; i++) {
                        let newTicket = createTicket(sprint, issues.issues[i]);
                        if (newTicket.Typ !== "Unteraufgabe") {
                            updateList(newTicket);
                        }
                    }
                }
            } else {
                logger.error('Error: ', error.toString()) // Print the google web page.
            }
        });
}

// END Jira Client

function  createSprint(sprint) {
    let newSprint = new SprintEntry(sprint.id);
    newSprint.Name = sprint.name;
    newSprint.Goal = sprint.goal;
    newSprint.Start = sprint.start;
    newSprint.End = sprint.end;
    newSprint.State = sprint.state;

    return newSprint;
}

function createTicket(sprint, issue) {
    let newTicket = new TicketEntry(issue.id);
    newTicket.Sprint = sprint;
    newTicket.Key = issue.key;
    newTicket.Summary = issue.fields.summary;
    if (issue.fields.issuetype) {
        newTicket.Typ = issue.fields.issuetype.name;
        newTicket.TypUrl = issue.fields.issuetype.iconUrl;
    }
    if (issue.fields.epic) {
        newTicket.EpicId = issue.fields.epic.id;
        newTicket.EpicName = issue.fields.epic.name;
    }
    if (issue.fields.creator) {
        newTicket.Reporter = issue.fields.creator.name;
        newTicket.ReporterUrl = issue.fields.creator.avatarUrls["32x32"];
    }
    if (issue.fields.assignee) {
        newTicket.Assignee = issue.fields.assignee.name;
        newTicket.AssigneeUrl = issue.fields.assignee.avatarUrls["32x32"];
    }
    if (issue.fields.status) {
        newTicket.Status = issue.fields.status.name;
        newTicket.StatusUrl = issue.fields.status.iconUrl;
    }
    newTicket.StoryPoints = issue.fields.customfield_10011;
    newTicket.TicketCreated = issue.fields.created;
    newTicket.TicketUpdated = issue.fields.updated;

    return newTicket;
}