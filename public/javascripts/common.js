"use strict"
const dateFormat = require('dateformat');
var Enum = require('enum');

var STATUS_LIGHTS = new Enum({
    'GRAY':0,
    'GREEN': 1,
    'YELLOW':2,
    'RED':3
});

var StatusEntry = function(id, typ, group, name, statusInt) {
    if (typeof(id)!== "number") {
        throw new WrongParameterException('wrong type: id expecting number, found ' + typeof(id));
    }
    if (typeof(statusInt)!== "number") {
        throw new WrongParameterException('wrong type: statusint expecting number, found ' + typeof(statusInt));
    }
    if ((statusInt < 0) || (statusInt > 3)) {
        throw new WrongParameterException('statusint must between 1 to 3');
    }
    this.Id = id;
    this.Typ = typ;
    this.Group = group;
    this.Name = name;
    this.Status = STATUS_LIGHTS.get(statusInt);
    this.UpdateDate = Date.now();
    this.UpdateDateStr = function() {return dateFormat(this.UpdateDate, 'dd.mm.yyyy HH:MM');}
    this.LastAlarmChange = Date.now();
    this.LastAlarmChangeStr = function() {return dateFormat(this.LastAlarmChange, 'dd.mm.yyyy HH:MM');}
    this.DelayAlarm = 0;
    this.Disabled = false;
};

var SprintEntry = function(id) {
    this.Id = id;
    this.Name = null;
    this.Goal = null;
    this.Start = null;
    this.StartStr = function() {return dateFormat(this.Start, 'dd.mm.yyyy HH:MM');}
    this.End = null;
    this.EndStr = null;
    this.EndStr = function() {return dateFormat(this.End, 'dd.mm.yyyy HH:MM');}
    this.State = null;
    this.UpdateDate = Date.now();
    this.UpdateDateStr = function() {return dateFormat(this.UpdateDate, 'dd.mm.yyyy HH:MM');}
};

var TicketEntry = function(id) {
    this.Id = id;
    this.Sprint = null;
    this.Key = null;
    this.Summary = null;
    this.Typ = null;
    this.TypUrl = null;
    this.EpicId = null;
    this.EpicName = null;
    this.Reporter = null;
    this.ReporterUrl = null;
    this.Assignee = null;
    this.AssigneeUrl = null;
    this.Status = null;
    this.StatusUrl = null;
    this.StoryPoints = null;
    this.TicketCreated = null;
    this.TicketCreatedStr = function() {return dateFormat(this.TicketCreated, 'dd.mm.yyyy HH:MM');}
    this.TicketUpdated = null;
    this.TicketUpdatedStr = function() {return dateFormat(this.TicketUpdated, 'dd.mm.yyyy HH:MM');}
    this.isFinished = function() {return this.Status == "Fertig";}
}

function WrongParameterException(message) {
    this.message = message;
};

module.exports = {
    STATUS_LIGHTS,
    StatusEntry,
    SprintEntry,
    TicketEntry,
    WrongParameterException
};

