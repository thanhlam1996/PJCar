var aws = require("aws-sdk");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");

//gan thu muc tinh de doc duoc trong ejs
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/ckeditor'));
aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

app.listen(8081);

var urlbodyParser = bodyParser.urlencoded({ extended: false });
app.set("view engine", "ejs");
app.set("Viewejs", "./viewejs");

var docClient = new aws.DynamoDB.DocumentClient();
//Decription: API RESTfull about all car information on world

//Get all car ==Scan
app.get("/", function (req, res) {
    res.render("index");
    res.end();
});
app.get("/create", function (req, res) {

    res.render("createcar");
    res.end();
});
app.get("/getallcar", function (req, res) {
    var params = {
        TableName: "Cars"
    }
    docClient.scan(params, function (err, data) {
        if (err) {
            res.send(err);
            console.error("ERR:  ", err, null, 2);
            res.end();
        }
        else {
            res.send(data);
            res.end();
            //res.render("index",{data})
        }
    });
});
app.post("/search_result",urlbodyParser, function(req,res){
    var params = {
        TableName: "Cars"
    }
    docClient.scan(params, function (err, data) {
        if (err) {
            res.send(err);
            console.error("ERR:  ", err, null, 2);
            res.end();
        }
        else {
            console.log(data);
            res.render("search_result", {data});
            res.end();
        }
    });
    // docClient.query(params, function (err, data) {
    //     if (err) {
    //         res.send(err);
    //         console.error("ERR:  ", err, null, 2);
    //         res.end();
    //     }
    //     else {
    //         console.log(data);
    //         res.render("search_result", {data});
    //         res.end();
    //     }
    // });
});
// app.post("/search_result",urlbodyParser, function(req,res){
//     var _version = req.body.txtsearch;
//     console.log(_version);
//     var params = {
//         TableName: "Cars",
//         KeyConditionExpression: "#vs=:v",
//         ExpressionAttributeNames: {
//             "#vs": "version"
//         },
//         ExpressionAttributeValues: {
//             ":v": _version
//         }
//     };
//     docClient.query(params, function (err, data) {
//         if (err) {
//             res.send(err);
//             console.error("ERR:  ", err, null, 2);
//             res.end();
//         }
//         else {
//             console.log(data);
//             res.render("search_result", {data});
//             res.end();
//         }
//     });
// });

//Get car by Manufacturer

app.get("/getcarmanufacturer/:manufacturer", function (req, res) {
    var _manufacturer = req.params.manufacturer;
    var params = {
        TableName: "Cars",
        ProjectionExpression: "#mf=:m",
        //FilterExpressions:
        ExpressionAttributeNames: {
            "#mf": "manufacturer"
        },
        ExpressionAttributeValues: {
            ":m": _manufacturer
        }
    };
    docClient.query(params, function (err, data) {
        if (err) {
            res.send(err);
            console.error("ERR:  ", err, null, 2);
            res.end();
        }
        else {
            res.send(data);
            res.end();
        }
    });
});

//Add car

app.post("/create", urlbodyParser, function (req, res) {
    if (req.method == 'POST') {

    }
    else {
        fs.readFileSync("./views/createcar.html", function (err, data) {
            if (err) {
                console.error("ERR : ", JSON.stringify(err, null, 2));
                res.writeHead(404, { "Content-Type": "text/html" });
                res.write("404 Not Found");
                res.end();
            }
            else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(data);
                res.end();
            }
        });
    }
});


