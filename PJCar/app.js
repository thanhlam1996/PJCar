var aws = require("aws-sdk");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var busboy = require('connect-busboy');
var busboyBodyParser = require('busboy-body-parser');
const Busboy = require('busboy');

//gan thu muc tinh de doc duoc trong ejs
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/ckeditor'));
app.use(busboy());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(busboyBodyParser());
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
    res.render("index", { cars: [], count: 0 });
    res.end();
});

// Show create car view
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

// Response for search action
app.post("/search_result", urlbodyParser, function (req, res) {
    var params = {
        TableName: "Cars"
    }

    var txtsearch = req.body.txtsearch.trim();

    if (txtsearch.length == 0) {
        res.render('index', { cars: [], count: 0 })
    }
    else {
        docClient.scan(params, function (err, data) {
            if (err) {
                res.send(err);
                console.error("ERR:  ", err, null, 2);
                res.end();
            }
            else {
                console.log(data);
                var result = [];
                data.Items.forEach(function (car) {
                    var object = JSON.stringify(car);
                    var n = object.toLowerCase().search(txtsearch.toLowerCase());
                    if (n != -1) {
                        result.push(car);
                    }
                });
                console.log(result);
                res.render('index', { cars: result, count: result.length });
            }
        });
    }
});

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

// Show login view
app.get("/login", function (req, res) {
    res.render("login");
})

// Submit login form
app.post("/login", urlbodyParser, function (req, res) {

    console.log(req.body.emaillogin);
    var email = req.body.emaillogin;
    var pass = req.body.passwordlogin;

    var params = {
        TableName: "User",
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    };

    docClient.query(params, function (err, data) {
        if (err) {
            res.send(err);
            console.error("ERR:  ", err, null, 2);
            res.end();
        }
        else {
            console.log("Get users info success.");
            if (data.Items.length == 0) {
                console.log("Email is not exist in system.");
                res.end("Email is not exist.");
            } else {
                if (data.Items[0].password == pass) {
                    res.end("Login success with email: " + req.body.emaillogin);
                }
                else {
                    res.end("Password is invalid.");
                }
            }
        }
    });
})

// Test template
app.get("/testtemplate", function (req, res) {
    res.render("test-template");
})

// Test submit upload image
app.get("/testupload", function (req, res) {
    console.log("Success to get test html");
    res.render("test_upload_img");
})

app.post("/testupload", urlbodyParser, function (req, res) {
    console.log(req.body);
    console.log(req.header);
    console.log(req.query);
})

// Prepare for upload
const BUCKET_NAME = 'test-bucket-hieunguyen';
const IAM_USER_KEY = 'AKIAIKHCXLMLZ4G3BTDA';
const IAM_USER_SECRET = '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';
function uploadToS3(file) {
    aws.config.update({
        region: "us-west-2",
        endpoint: "s3.us-west-2.amazonaws.com"
    });

    let s3bucket = new aws.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME,
    });
    s3bucket.createBucket(function () {
        var params = {
            Bucket: BUCKET_NAME,
            Key: file.name,
            Body: file.data,
        };
        s3bucket.upload(params, function (err, data) {
            if (err) {
                console.log('error in callback');
                console.log(err);
            }
            console.log('success');
            console.log(data);
        });
    });
}

// Get image method
function getFromS3(name, callback) {
    aws.config.update({
        region: "us-west-2",
        endpoint: "s3.us-west-2.amazonaws.com"
    });

    let s3bucket = new aws.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME,
    });

    var params = {
        Bucket: BUCKET_NAME,
        Key: name
    };
    s3bucket.getObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } // an error occurred
        else {
            console.log(data);
        }       // successful response
        callback(data, err);

        /*
        data = {
         AcceptRanges: "bytes", 
         ContentLength: 3191, 
         ContentType: "image/jpeg", 
         ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
         LastModified: <Date Representation>, 
         Metadata: {
         }, 
         TagCount: 2, 
         VersionId: "null"
        }
        */
    });
}

// Upload to aws S3
app.post('/api/upload', function (req, res, next) {
    // This grabs the additional parameters so in this case passing     
    // in "element1" with a value.
    const element1 = req.body.element1;
    var busboy = new Busboy({ headers: req.headers });
    // The file upload has completed
    busboy.on('finish', function () {
        console.log('Upload finished');
        // Your files are stored in req.files. In this case,
        // you only have one and it's req.files.element2:
        // This returns:
        // {
        //    element2: {
        //      data: ...contents of the file...,
        //      name: 'Example.jpg',
        //      encoding: '7bit',
        //      mimetype: 'image/png',
        //      truncated: false,
        //      size: 959480
        //    }
        // }
        // Grabs your file object from the request.
        const file = req.files.element2;
        console.log(file);
        uploadToS3(file);
    });
    req.pipe(busboy);

    res.end("Upload success.");
});

app.get("/getimage", urlbodyParser, function (req, res) {
    res.render('test-get-image');
})

// Test get img from S3
app.get("/api/getimage", urlbodyParser, function (req, res) {

    console.log(req.query.imgname);
    name = req.query.imgname;
    getFromS3(name, function (data, err) {
        if (err) {
            res.send("Fail to get image file.");
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data.Body);
        }
    })
})