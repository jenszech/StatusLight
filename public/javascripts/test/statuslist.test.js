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

test('updateList - new Entries', function() {
    // noinspection DuplicatedCode
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

test('updateList - Update Entry', function() {
    // noinspection DuplicatedCode
    let statuslist = require('../statuslist');

    statuslist.init();
    let list1 = statuslist.getList();
    expect(list1.length).toBe(0);

    let element1 = new StatusEntry(1, "Manuel", "Group1", "Name1", 1);
    let element2 = new StatusEntry(1, "Manuel", "Group1", "Name1", 3);
    statuslist.updateList(element1, 0);
    expect(list1.length).toBe(1);
    expect(list1[0]).toEqual(element1);

    statuslist.updateList(element2, 0);
    expect(list1.length).toBe(1);
    expect(element1.Status.value).toBe(element2.Status.value);
});

test('updateList - WrongParameter', function() {
    let statuslist = require('../statuslist');

    statuslist.init();
    expect(() => {
        statuslist.updateList(11, 0);
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

    expect(statuslist.getStatus(22, "Manuel")).toEqual(element2);
    expect(statuslist.getStatus(21, "Manuel")).toEqual(element1);
});

test('setDisable', function() {
    let statuslist = require('../statuslist');

    statuslist.init();
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 1);
    let element2 = new StatusEntry(22, "Manuel", "Group1", "Name2", 1);
    statuslist.updateList(element1, 0);
    statuslist.updateList(element2, 0);
    statuslist.setDisable(22, "Manuel", true);

    expect(element1.Disabled).toEqual(false);
    expect(element2.Disabled).toEqual(true);

    expect(statuslist.getStatus(21, "Manuel")).toEqual(element1);
    expect(statuslist.getStatus(22, "Manuel")).toEqual(element2);
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
    // noinspection DuplicatedCode
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

test('getAlerts delay test', function() {
    const now = Math.round(Date.now() / 100000) * 100000;

    let dateNowStub = jest.fn()
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 1000)
        .mockReturnValueOnce(now + 2000)
        .mockReturnValueOnce(now + 3000);

    global.Date.now = dateNowStub;

    let statuslist = require('../statuslist');
    statuslist.init();

    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 1);
    let element2 = new StatusEntry(22, "Manuel", "Group1", "Name2", 2);
    let element3 = new StatusEntry(23, "Manuel", "Group2", "Name3", 3);
    let element4 = new StatusEntry(24, "Manuel", "Group2", "Name4", 1);

    statuslist.updateList(element1, 0);
    statuslist.updateList(element2, 2);
    statuslist.updateList(element3, 1);
    statuslist.updateList(element4, 0);

    expect(statuslist.getAlerts().length).toBe(0);
    let alerts = statuslist.getAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0]).toEqual(element3);

    expect(statuslist.getAlerts().length).toBe(2);
});

test('setUpdateCallback', function() {
    // noinspection DuplicatedCode
    let statuslist = require('../statuslist');
    const myMock = jest.fn();

    statuslist.init();
    statuslist.setUpdateCallback(myMock);

    expect(myMock.mock.calls.length).toBe(0);
    statuslist.updateList(new StatusEntry(1, "Manuel", "Group1", "Name1", 1), 0);
    expect(myMock.mock.calls.length).toBe(1);
});

test('setState - Parameter test', function() {
    let statuslist = require('../statuslist');
    let status = STATUS_LIGHTS.GREEN;
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 0);

    expect(() => {
        statuslist.setState(null, status);
    }).toThrow(WrongParameterException);

    expect(() => {
        statuslist.setState(element1, 1);
    }).toThrow(WrongParameterException);

    status.value= 4;
    expect(() => {
        statuslist.setState(element1, status);
    }).toThrow(WrongParameterException);

    status.value= -1;
    expect(() => {
        statuslist.setState(element1, status);
    }).toThrow(WrongParameterException);
    status.value= 1;
});

test('setState - Status Change', function() {
    let statuslist = require('../statuslist');
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 0);

    expect(element1.Status).toBe(STATUS_LIGHTS.GRAY);
    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.Status).toBe(STATUS_LIGHTS.GREEN);

    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.Status).toBe(STATUS_LIGHTS.YELLOW);
    statuslist.setState(element1, STATUS_LIGHTS.GRAY);
    expect(element1.Status).toBe(STATUS_LIGHTS.YELLOW);

    statuslist.setState(element1, STATUS_LIGHTS.RED);
    expect(element1.Status).toBe(STATUS_LIGHTS.RED);
    statuslist.setState(element1, STATUS_LIGHTS.GRAY);
    expect(element1.Status).toBe(STATUS_LIGHTS.RED);

    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.Status).toBe(STATUS_LIGHTS.GREEN);
    statuslist.setState(element1, STATUS_LIGHTS.GRAY);
    expect(element1.Status).toBe(STATUS_LIGHTS.GREEN);
});

test('setState - Date Change', function() {
    const now = Math.round(Date.now() / 100000) * 100000;

    let dateNowStub = jest.fn().mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 1000)
        .mockReturnValueOnce(now + 2000)
        .mockReturnValueOnce(now + 3000);

    global.Date.now = dateNowStub;

    let statuslist = require('../statuslist');
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 0);


    expect(element1.Status).toBe(STATUS_LIGHTS.GRAY);
    statuslist.setState(element1, STATUS_LIGHTS.GRAY);
    expect(element1.LastAlarmChange).toBe(now);

    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.LastAlarmChange).toBe(now + 1000);

    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.LastAlarmChange).toBe(now + 1000);

    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.LastAlarmChange).toBe(now + 2000);

    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.LastAlarmChange).toBe(now + 2000);

    statuslist.setState(element1, STATUS_LIGHTS.RED);
    expect(element1.LastAlarmChange).toBe(now + 2000);

    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.LastAlarmChange).toBe(now + 2000);

    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.LastAlarmChange).toBe(now + 3000);
});

test('setState - SET Disable', function() {
    // noinspection DuplicatedCode
    let statuslist = require('../statuslist');
    let element1 = new StatusEntry(21, "Manuel", "Group1", "Name1", 0);
    statuslist.updateList(element1, 0);

    expect(element1.Disabled).toBe(false);

    statuslist.setState(element1, STATUS_LIGHTS.GRAY);
    statuslist.setDisable(element1.Id, element1.Typ, true);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.GRAY);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.Disabled).toBe(false);

    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    statuslist.setDisable(element1.Id, element1.Typ, true);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.Disabled).toBe(false);

    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    statuslist.setDisable(element1.Id, element1.Typ, true);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.RED);
    expect(element1.Disabled).toBe(false);

    statuslist.setState(element1, STATUS_LIGHTS.RED);
    statuslist.setDisable(element1.Id, element1.Typ, true);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.RED);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.Disabled).toBe(false);

    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    statuslist.setDisable(element1.Id, element1.Typ, true);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.YELLOW);
    expect(element1.Disabled).toBe(true);
    statuslist.setState(element1, STATUS_LIGHTS.GREEN);
    expect(element1.Disabled).toBe(false);
});

