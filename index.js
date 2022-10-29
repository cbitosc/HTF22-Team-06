MongoClient = require('mongodb').MongoClient;
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const { devNull } = require('os');
const { GridFSBucket } = require('mongodb');
const { redirect } = require('express/lib/response');
// const url = 'mongodb://localhost:27017/';
const url = 'mongodb+srv://shahbazjahan9:shahbazjahan9@cluster0.vb8fvg4.mongodb.net/?retryWrites=true&w=majority';
const databasename = 'team6';
const session = require('express-session');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(databasename);
    // var query={username:"160120733050"};
    // dbo.collection("login").find(query).toArray(function(err,result){
    //     if (err) throw err;
    //     console.log(result);
    //     console.log(result[0].username);
    //     console.log(result[0].password);
    //     db.close;
    // });
    // to create a collection
    // dbo.createCollection("login",function(err,res){
    //     if(err)throw err;
    //     console.log('collection created');
    //     db.close();
    // });

    //to insert 
    // var myobj = {  tid: "1001",sid:"160120733003",hour:"1",date:"08-06-2022", present:"1"};
    // dbo.collection("tablename").insertOne(myobj,function(err,res){
    //         if (err) throw err;
    //         console.log("1 document inserted");
    //         db.close;
    //     });

    //to delete
    // var myquery={username:"160120733050"}
    // dbo.collection("collection name").deleteOne(myquery,function(err,obj){
    //     if (err) throw err;
    //     console.log('1 document deleted');
    //     db.close();
    // });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/check', function (req, res) {
    let uname = req.body.username;
    let pword = req.body.password;
    // console.log("entered username",uname);
    // console.log("entered password",pword);
    if (uname && pword) {

        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            dbo = db.db(databasename);
            var query = { username: uname };
            dbo.collection("login").find(query).toArray(function (err, result) {
                // console.log(result[0].username);
                // console.log(result[0].password);
                if (result.length == 0) {
                    res.sendFile(__dirname + '/index.html');
                }
                else {
                    if (err) throw err;
                    else {
                        if (result[0].password == pword && result[0].type == "student") {
                            req.session.loggedin = true;
                            req.session.username = uname;
                            req.session.type = "student";
                            res.redirect("/student-home");
                        }
                        if (result[0].password == pword && result[0].type == "teacher") {
                            req.session.loggedin = true;
                            req.session.username = uname;
                            req.session.type = "teacher";
                            res.redirect("/teacher-home");
                        }
                    }
                }
                db.close;
            });
        });
    }
    else {
        res.sendFile(__dirname + '/index.html');
    }
});

app.get('/student-home', function (req, res) {
    if (req.session.loggedin && req.session.type == "student") {
    res.sendFile(__dirname + '/student_home.html');
    }
    else
    {
        res.sendFile(__dirname + '/index.html');
    }
});

app.get('/teacher-home', function (req, res) {
    if (req.session.loggedin && req.session.type == "teacher") {
        res.sendFile(__dirname + '/teacher_home.html');
    }
    else
    {
        res.sendFile(__dirname + '/index.html');
    }
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});