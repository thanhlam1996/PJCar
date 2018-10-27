var aws = require("aws-sdk");
var fs = require("fs");

aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

//Access key

aws.config.accessKeyId = "AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey = "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";

var docClient = new aws.DynamoDB.DocumentClient();

console.log("Importing users into DynamoDB. Please wait...");

var users = JSON.parse(fs.readFileSync("data/user.json", "utf-8"));
users.forEach(function (user) {
    var params = {
        TableName: "User",
        Item: {
            "email": user.email,
            "password": user.password
        }
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add user", user.email, " .Error Json: ", JSON.stringify(err, null, 2));
        }
        else {
            console.log("PutItem succeeded: ", user.email);
        }
    });
});