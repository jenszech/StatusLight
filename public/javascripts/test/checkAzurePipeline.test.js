// __tests__/statuslist.test.js

// noinspection JSUnusedLocalSymbols
let winston = require('../../../config/winston');

jest.dontMock('../checkAzurePipeline.js');
jest.mock('request');

const resp_config = {
    "azurePipeline": {
        "enable": true,
        "host": "dev.azure.com",
        "organization": "testorga",
        "project": "testproject",
        "apiversion": "5.0-preview.1",
        "apiToken": "xxxyyyzzzz",
        "alertLight": 3,
        "pipelines": [
            {"definitionId": 1, "branch": "master"},
        ]
    }
};

/*
const resp_pipelines = {
    "pipelines":[
        {"definitionId": 1, "branch": "master"},
        {"definitionId": 1, "branch": "develop"},
        {"definitionId": 2, "branch": "release"},
        {"definitionId": 3, "branch": "develop"}
        ]
};
*/

test('init', function() {
    let checkAzure = require('../checkAzurePipeline');
    checkAzure.setConfig(resp_config);
    checkAzure.initCheck(null);
    expect(true);
});

test('checkStatus', function() {
    //const myRequestMock = jest.fn((options, callback) => console.log(options));
    //global.request = myRequestMock;

    let checkAzure = require('../checkAzurePipeline');
    checkAzure.setConfig(resp_config);
    checkAzure.initCheck(null);
    checkAzure.checkStatus();
    //expect(myRequestMock.mock.calls.length).toBe(1);
    //expect(myRequestMock.mock.calls).toContainEqual(["https://dev.azure.com/testorga/testproject/_apis/build/latest/1?api-version=5.0-preview.1&branchName=master"]);
    //"https://dev.azure.com/testorga/testproject/_apis/build/latest/1?api-version=5.0-preview.1&branchName=master"
    expect(true);
});

test('updateStatusFromAzure', function() {
    let statuslist = require('../statuslist');
    let list1 = statuslist.getList();
    let checkAzure = require('../checkAzurePipeline');
    checkAzure.setConfig(resp_config);
    checkAzure.initCheck(statuslist.updateList);
    const testJson1 = require('./data/azurePiplineResponse.json');

    expect(list1.length).toBe(0);

    testJson1.result = "succeeded";
    checkAzure.updateStatusFromAzure(testJson1);
    expect(list1.length).toBe(1);
    expect(statuslist.getAlerts().length).toBe(0);

    testJson1.result = "canceled";
    checkAzure.updateStatusFromAzure(testJson1);
    expect(list1.length).toBe(1);
    expect(statuslist.getAlerts().length).toBe(0);

    testJson1.result = "failed";
    checkAzure.updateStatusFromAzure(testJson1);
    expect(list1.length).toBe(1);
    expect(statuslist.getAlerts().length).toBe(1);

    testJson1.result = "canceld";
    checkAzure.updateStatusFromAzure(testJson1);
    expect(list1.length).toBe(1);
    expect(statuslist.getAlerts().length).toBe(1);

    testJson1.result = "failed";
    testJson1.sourceBranch = "refs/heads/master";
    checkAzure.updateStatusFromAzure(testJson1);
    expect(list1.length).toBe(2);
    expect(statuslist.getAlerts().length).toBe(2);

    testJson1.result = "succeeded";
    checkAzure.updateStatusFromAzure(testJson1);
    expect(list1.length).toBe(2);
    expect(statuslist.getAlerts().length).toBe(1);
});

