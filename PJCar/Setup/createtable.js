var aws = require("aws-sdk");

aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

//Access key

aws.config.accessKeyId = "AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey = "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";

var dynamodb = new aws.DynamoDB();

var carsParams = {
    TableName: "Cars",
    KeySchema: [
        { AttributeName: "version", KeyType: "HASH" }, //partition key
        { AttributeName: "carname", KeyType: "RANGE" } //Sort key
    ],

    AttributeDefinitions: [
        { AttributeName: "version", AttributeType: "S" },
        { AttributeName: "carname", AttributeType: "S" }
    ],

    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(carsParams, function (err, data) {
    if (err) {
        console.error("Unable to create table. Error", JSON.stringify(err, null, 2));
    }
    console.log("Created table. Table description Json: ", JSON.stringify(data, null, 2));
});

var userParams = {
    TableName: "User",
    KeySchema: [
        { AttributeName: "email", KeyType: "HASH" }, //partition key
        { AttributeName: "password", KeyType: "RANGE" } //Sort key

    ],

    AttributeDefinitions: [
        { AttributeName: "email", AttributeType: "S" },
        { AttributeName: "password", AttributeType: "S" }
    ],

    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(userParams, function (err, data) {
    if (err) {
        console.error("Unable to create table. Error", JSON.stringify(err, null, 2));
    }
    console.log("Created table. Table description Json: ", JSON.stringify(data, null, 2));
});