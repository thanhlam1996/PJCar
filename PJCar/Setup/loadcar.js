var aws=require("aws-sdk");
var fs=require("fs");

aws.config.update({
    region: "us-west-2",
    endpoint:"http://localhost:8000"
});

//Access key

aws.config.accessKeyId="AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey="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";

var docClient=new  aws.DynamoDB.DocumentClient();

console.log("Importing cars into DynamoDB. Please wait...");

var allcar=JSON.parse(fs.readFileSync("../data/car.json","utf-8"));
allcar.forEach(function(car){
    var params={
        TableName: "Cars",
        Item:{
            "version":car.version,
            "carname": car.carname,
            "info": car.info
        }
    };
    docClient.put(params, function(err, data){
        if(err)
        {
            console.error("Unable to add car", car.carname, " .Error Json: ", JSON.stringify(err, null,2));
        }
        else
        {
            console.log("PutItem succeeded: ", car.carname);
        }
});
});