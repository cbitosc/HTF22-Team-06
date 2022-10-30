MongoClient = require("mongodb").MongoClient
const express = require("express")
const mongoose = require("mongoose")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const path = require("path")
const { devNull } = require("os")
const { GridFSBucket } = require("mongodb")
const { redirect } = require("express/lib/response")
// const url = 'mongodb://localhost:27017/';
const url =
  "mongodb+srv://shahbazjahan9:shahbazjahan9@cluster0.vb8fvg4.mongodb.net/?retryWrites=true&w=majority"
const databasename = "team6"
const session = require("express-session")
const { runInNewContext } = require("vm")
const app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

MongoClient.connect(url, function (err, db) {
  if (err) throw err
  var dbo = db.db(databasename)
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
})

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/templates/login.html")
})

app.post("/check", function (req, res) {
  let uname = req.body.username
  let pword = req.body.password
  // console.log("entered username",uname);
  // console.log("entered password",pword);
  if (uname && pword) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      dbo = db.db(databasename)
      var query = { username: uname }
      dbo
        .collection("login")
        .find(query)
        .toArray(function (err, result) {
          // console.log(result[0].username);
          // console.log(result[0].password);
          if (result.length == 0) {
            res.sendFile(__dirname + "/templates/login.html")
          } else {
            if (err) throw err
            else {
              if (result[0].password == pword && result[0].type == "student") {
                req.session.loggedin = true
                req.session.username = uname
                req.session.type = "student"
                res.redirect("/student-home")
              }
              if (result[0].password == pword && result[0].type == "teacher") {
                req.session.loggedin = true
                req.session.username = uname
                req.session.display_name = result[0].display_name
                req.session.type = "teacher"
                res.redirect("/teacher-home")
              }
            }
          }
          db.close
        })
    })
  } else {
    res.sendFile(__dirname + "/templates/login.html")
  }
})

app.get("/student-home", function (req, res) {
  if (req.session.loggedin && req.session.type == "student") {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var query = { username: "160120733050" }
      dbo
        .collection("login")
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err
          // console.log(result);
          var branch = result[0].branch
          var year = result[0].year
          var query2 = { branch: branch, year: year }
          dbo
            .collection("course")
            .find(query2)
            .toArray(function (err, result2) {
              if (err) throw err
              console.log(result2)
              res.render(__dirname + "/templates/landing.ejs", {
                data: result2,
                rollno: req.session.username,
              })
              db.close
            })

          // console.log(result[0].username);
          // console.log(result[0].password);
          db.close
        })
      // res.render(__dirname + '/templates/landing.ejs', { rollno: req.session.username });
      // res.render(__dirname + "/teacher_class2.ejs", { uname: uname });
    })
  } else {
    res.sendFile(__dirname + "/templates/login.html")
  }
})

app.get("/teacher-home", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      // var query={username:"160120733050"};
      // dbo.collection("login").find(query).toArray(function(err,result){
      //     if (err) throw err;
      //     console.log(result);
      //     console.log(result[0].username);
      //     console.log(result[0].password);
      //     db.close;
      // });
      var query = { teacher_id: req.session.username }
      dbo
        .collection("course")
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err
          console.log("My results: ", result)
          res.render(__dirname + "/templates/teacher_home.ejs", {
            rollno: req.session.display_name,
            tid: req.session.username,
            tname: req.session.display_name,
            data: result,
          })
        })
    })
  } else {
    res.sendFile(__dirname + "/templates/login.html")
  }
})

app.get("/registration", function (req, res) {
  res.sendFile(__dirname + "/templates/register.html")
})

//after successful registration
app.post("/registration", function (req, res) {
  var rollno = req.body.rollnumber
  var email = req.body.email
  var username = req.body.username
  var password = req.body.password
  var cpassword = req.body.cpassword
  var str_roll = rollno.toString()
  if (password != cpassword || str_roll.length != 12) {
    console.log("Incorrect password")
  }
  //console.log(rollno>160100000000)

  if (password == cpassword) {
    var year = "20" + rollno[4] + rollno[5]
    var dept = rollno[6] + rollno[7] + rollno[8]
    d = { 733: "CSE", 734: "EEE", 736: "Mechanical" }

    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = {
        username: rollno,
        password: password,
        type: "student",
        email: email,
        branch: d[dept],
        year: year,
      }
      dbo.collection("login").insertOne(myobj, function (err, res) {
        if (err) throw err
        console.log("1 document inserted")
      })
    })
  }

  res.sendFile(__dirname + "/templates/login.html")
})
app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/templates/signup.html")
})
// app.get('/course-clicked', function (req, res) {
//     if (req.session.loggedin && req.session.type == "student") {
//         res.render(__dirname + "/templates/course.html", {})
//     }
// });

app.get("/student-home/:course_id", function (req, res) {
  if (req.session.loggedin && req.session.type == "student") {
    // res.sendFile(__dirname + '/teacher_home.html');
    // console.log(req.params.course_id);
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = { course_id: req.params.course_id }
      dbo
        .collection("course")
        .find(myobj)
        .toArray(function (err, result) {
          if (err) throw err
          // console.log(result);
          var myobj2 = { username: result[0].teacher_id }
          dbo
            .collection("login")
            .find(myobj2)
            .toArray(function (err, result2) {
              if (err) throw err
              console.log(result2)
              var myobj3 = { course_id: req.params.course_id }
              dbo
                .collection("assignment_list")
                .find(myobj3)
                .toArray(function (err, result3) {
                  if (err) throw err
                  res.render(__dirname + "/templates/course.ejs", {
                    teacher_name: result2[0].display_name,
                    course_title: result[0].course_title,
                    course_description: result[0].course_description,
                    result3: result3,
                  })
                  db.close
                })
              db.close
            })
          db.close
        })
    })

    // console.log(result[0].username);
    // console.log(result[0].password);
    // res.sendFile(__dirname + "/templates/course.html");
  }
  // else
  // {
  //     res.sendFile(__dirname + '/templates/login.html');
  // }
})

app.get("/student-home/assignment/:assignment_id", function (req, res) {
  if (req.session.loggedin && req.session.type == "student") {
    var ass_id = req.params.assignment_id
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = { assignment_id: ass_id }
      dbo
        .collection("assignment_list")
        .find(myobj)
        .toArray(function (err, result) {
          if (err) throw err
          console.log(result)
          var cid = result[0].course_id
          var myobj1 = { course_id: cid }
          dbo
            .collection("course")
            .find(myobj1)
            .toArray(function (err, result2) {
              if (err) throw err
              console.log(result2)
              var myobj2 = {
                student_id: req.session.username,
                assignment_id: ass_id,
              }
              dbo
                .collection("assignment_submission")
                .find(myobj2)
                .toArray(function (err, result3) {
                  if (err) throw err
                  res.render(
                    __dirname + "/templates/assignment_submission.ejs",
                    {
                      course_title: result2[0].course_title,
                      assignment_description: result[0].assignment_description,
                      deadline: result[0].deadline,
                      status: result3[0].status,
                    }
                  )
                })
              db.close
            })
          db.close
        })
    })
  } else {
    res.sendFile(__dirname + "/templates/login.html")
  }
})

app.get("/teacher-home/:course_id", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    // res.sendFile(__dirname + '/teacher_home.html');
    // console.log(req.params.course_id);
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = { course_id: req.params.course_id }
      dbo
        .collection("course")
        .find(myobj)
        .toArray(function (err, result) {
          if (err) throw err
          console.log(result)

          var myobj3 = { course_id: req.params.course_id }
          dbo
            .collection("assignment_list")
            .find(myobj3)
            .toArray(function (err, result3) {
              if (err) throw err
              res.render(__dirname + "/templates/teacher_course.ejs", {
                teacher_name: req.session.display_name,
                course_title: result[0].course_title,
                course_id: result[0].course_id,
                course_description: result[0].course_description,
                result3: result3,
              })
              db.close
            })
          db.close
        })
    })

    // console.log(result[0].username);
    // console.log(result[0].password);
    // res.sendFile(__dirname + "/templates/course.html");
  }
  // else
  // {
  //     res.sendFile(__dirname + '/templates/login.html');
  // }
})

app.get("/teacher-home/:course_id/:assignment_id/edit", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    // res.sendFile(__dirname + '/teacher_home.html');
    // console.log(req.params.course_id);
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = {
        assignment_id: req.params.assignment_id,
        course_id: req.params.course_id,
      }
      dbo
        .collection("assignment_list")
        .find(myobj)
        .toArray(function (err, result) {
          if (err) throw err
          console.log(result)
          res.render(__dirname + "/templates/teacher_give_assign.ejs", {
            course_id: req.params.course_id,
            data: result[0],
          })
          db.close
        })
    })
  }
})

app.post("/teacher-home/:course_id/:assignment_id/edit", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = {
        course_id: req.params.course_id,
        teacher_id: req.session.username,
        assignment_title: req.body.title,
        assignment_description: req.body.description,
        deadline: req.body.deadline,
        assignment_id: req.body.aid,
      }
      dbo.collection("assignment_list").updateOne(myobj, function (err, _res) {
        if (err) throw err
        console.log("1 document inserted")
        res.redirect(`/teacher-home/${req.params.course_id}`)
        db.close
      })
    })
    // console.log(req.body)
    // res.send(req.body)
  }
})

app.get("/assignment_new/:course_id", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    // res.sendFile(__dirname + '/teacher_home.html');
    // console.log(req.params.course_id);
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = { course_id: req.params.course_id }
      dbo
        .collection("assignment_list")
        .find(myobj)
        .toArray(function (err, result) {
          if (err) throw err
          // console.log(result);
          var myobj2 = { username: req.session.username }
          res.render(__dirname + "/templates/teacher_give_assign.ejs", {
            course_id: req.params.course_id,
            data: null,
          })
          db.close
        })
    })
  }
})

app.post("/assignment_new/:course_id", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      var myobj = {
        course_id: req.params.course_id,
        teacher_id: req.session.username,
        assignment_title: req.body.title,
        assignment_description: req.body.description,
        deadline: new Date(`${req.body.deadline1} ${req.body.deadline2}`),
        assignment_id: req.body.aid,
      }
      dbo.collection("assignment_list").insertOne(myobj, function (err, _res) {
        if (err) throw err
        console.log("1 document inserted")
        res.redirect(`/teacher-home/${req.params.course_id}`)
        db.close
      })
    })
    // res.send(req.body)
  }
})

// app.get('/teacher-home', function (req, res) {
//     if (req.session.loggedin && req.session.type == "teacher") {
//         res.sendFile(__dirname + '/teacher_home.html');
//     }
//     else
//     {
//         res.sendFile(__dirname + '/templates/login.html');
//     }
// });

app.listen(3000, function () {
  console.log("app listening on port 3000!")
})
