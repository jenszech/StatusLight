// __tests__/statuslist.test.js

// noinspection JSUnusedLocalSymbols
let winston = require('../../../config/winston');
const { STATUS_LIGHTS, StatusEntry, WrongParameterException } = require('../common');

jest.dontMock('../statuslist');

test('init', function() {
    let statuslist = require('../statuslist');
    statuslist.init();
    expect(true);
});

test('getList', function() {
    let statuslist = require('../statuslist');
    statuslist.init();
    expect(true);
});

test('getList', function() {
    let statuslist = require('../statuslist');

    let list1 = statuslist.getList();
    expect(list1).toBeDefined();
    expect(list1.length).toBe(0);

    statuslist.init();
    let list2 = statuslist.getList();
    expect(list2).toEqual(list1);
});

test('updateList', function() {
    let statuslist = require('../statuslist');

    statuslist.init();
    let list1 = statuslist.getList();
    expect(list1.length).toBe(0);

    let element1 = new StatusEntry(1, "Manuel", "Group1", "Name1", 1);
    statuslist.updateList(element1, 0);
    expect(list1.length).toBe(1);
    expect(list1[0]).toEqual(element1);

    let element2 = new StatusEntry(2, "Manuel", "Group1", "Name2", 1);
    statuslist.updateList(element2, 0);
    expect(list1.length).toBe(2);
    expect(list1[1]).toEqual(element2);

    let element3 = new StatusEntry(3, "Manuel", "Group2", "Name3", 1);
    statuslist.updateList(element3, 0);
    expect(list1[2]).toEqual(element3);
    expect(list1.length).toBe(3);

    let list2 = statuslist.getList();
    expect(list2).toEqual(list1);
});

test('updateList - new Status', function() {
    let element1;
    expect(() => {
        new StatusEntry(1, "Manuel", "Group1", "Name1", -1)
    }).toThrow(WrongParameterException);
    element1 = new StatusEntry(1, "Manuel", "Group1", "Name1", 0);
    element1 = new StatusEntry(1, "Manuel", "Group1", "Name1", 3);
    expect(() => {
        new StatusEntry(1, "Manuel", "Group1", "Name1", 4)
    }).toThrow(WrongParameterException);

    expect(() => {
        new StatusEntry(1, "Manuel", "Group1", "Name1", "YELLOW")
    }).toThrow(WrongParameterException);

    expect(() => {
        new StatusEntry("ID1", "Manuel", "Group1", "Name1", -1)
    }).toThrow(WrongParameterException);

});

test('getStatus', function() {
    let statuslist = require('../statuslist');

    statuslist.init();
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 1);
    let element2 = new StatusEntry(22, "Manuel", "Group1", "Name2", 1);
    let element3 = new StatusEntry(23, "Manuel", "Group2", "Name3", 1);
    statuslist.updateList(element1, 0);
    statuslist.updateList(element2, 0);
    statuslist.updateList(element3, 0);

    expect(statuslist.getStatus(22)).toEqual(element2);
    expect(statuslist.getStatus(21)).toEqual(element1);
});

test('setDisable', function() {
    let statuslist = require('../statuslist');

    statuslist.init();
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 1);
    let element2 = new StatusEntry(22, "Manuel", "Group1", "Name2", 1);
    statuslist.updateList(element1, 0);
    statuslist.updateList(element2, 0);
    statuslist.setDisable(22, true);

    expect(element1.Disabled).toEqual(false);
    expect(element2.Disabled).toEqual(true);

    expect(statuslist.getStatus(21)).toEqual(element1);
    expect(statuslist.getStatus(22)).toEqual(element2);
});

test('getGesamtStatus', function() {
    let statuslist = require('../statuslist');

    statuslist.init();
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 1);
    let element2 = new StatusEntry(22, "Manuel", "Group1", "Name2", 2);
    let element3 = new StatusEntry(23, "Manuel", "Group2", "Name3", 3);
    let element4 = new StatusEntry(24, "Manuel", "Group2", "Name4", 1);

    expect(statuslist.getGesamtStatus()).toEqual(STATUS_LIGHTS.GRAY);

    statuslist.updateList(element1, 0);
    expect(statuslist.getGesamtStatus()).toEqual(STATUS_LIGHTS.GREEN);

    statuslist.updateList(element2, 0);
    expect(statuslist.getGesamtStatus()).toEqual(STATUS_LIGHTS.YELLOW);

    statuslist.updateList(element3, 0);
    expect(statuslist.getGesamtStatus()).toEqual(STATUS_LIGHTS.RED);

    statuslist.updateList(element4, 0);
    expect(statuslist.getGesamtStatus()).toEqual(STATUS_LIGHTS.RED);

    element3.Status = 1;
    expect(statuslist.getGesamtStatus()).toEqual(STATUS_LIGHTS.YELLOW);

    element2.Status = 1;
    expect(statuslist.getGesamtStatus()).toEqual(STATUS_LIGHTS.GREEN);
});

test('getAlerts', function() {
    let statuslist = require('../statuslist');

    statuslist.init();
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 1);
    let element2 = new StatusEntry(22, "Manuel", "Group1", "Name2", 2);
    let element3 = new StatusEntry(23, "Manuel", "Group2", "Name3", 3);
    let element4 = new StatusEntry(24, "Manuel", "Group2", "Name4", 1);

    statuslist.updateList(element1, 0);
    statuslist.updateList(element2, 0);
    statuslist.updateList(element3, 0);
    statuslist.updateList(element4, 0);

    let alerts = statuslist.getAlerts();
    expect(alerts.length).toBe(2);
    expect(alerts[0]).toEqual(element2);
    expect(alerts[1]).toEqual(element3);

});

test('setUpdateCallback', function() {
    //let statuslist = require('../statuslist');
    expect(true);
});

