var aws = require("aws-sdk");

aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

//Access key

aws.config.accessKeyId = "AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey = "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";

var dynamodb = new aws.DynamoDB();

var params = {
    TableName: "User"
}

dynamodb.deleteTable(params, function (err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log("Delete success.");
    }
})

var params = {
    TableName: "Cars"
}

dynamodb.deleteTable(params, function (err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log("Delete success.");
    }
})