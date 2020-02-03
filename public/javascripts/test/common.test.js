// __tests__/statuslist.test.js

// noinspection JSUnusedLocalSymbols
let winston = require('../../../config/winston');
const { StatusEntry, WrongParameterException } = require('../common');

jest.dontMock('../common.js');

test('new StatusEntry', function() {
    let element1;
    expect(() => {
        new StatusEntry(1, "Manuel", "Group1", "Name1", -1)
    }).toThrow(WrongParameterException);

    element1 = new StatusEntry(1, "Manuel", "Group1", "Name1", 0);
    expect(element1).toBeDefined();
    element1 = new StatusEntry(1, "Manuel", "Group1", "Name1", 3);
    expect(element1).toBeDefined();
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

