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
const nodemailer = require("nodemailer")
const schedule = require("node-schedule")
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
                req.session.branch = result[0].branch
                req.session.year = result[0].year
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
      var query = { username: req.session.username }
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
              // console.log(result2)
              // var year = "20" + rollno[4] + rollno[5]
              // var dept = rollno[6] + rollno[7] + rollno[8]
              // d = { 733: "CSE", 734: "EEE", 736: "Mechanical" }
              // var query = { year: req.session.year,branch:req.session.branch };
              dbo
                .collection("assignment_list")
                .find()
                .toArray(function (err, result3) {
                  if (err) throw err
                  // console.log(result3);
                  let assign = []
                  for (var i = 0; i < result2.length; i++) {
                    for (var j = 0; j < result3.length; j++) {
                      if (result2[i].course_id == result3[j].course_id) {
                        assign.push(result3[j])
                      }
                    }
                  }
                  assign.sort(function (a, b) {
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return new Date(a.deadline) - new Date(b.deadline)
                  })
                  console.log(assign)
                  res.render(__dirname + "/templates/landing.ejs", {
                    data: result2,
                    rollno: req.session.username,
                    assign: assign,
                  })
                  db.close
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
          // console.log("My results: ", result)
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
  } else {
    res.sendFile(__dirname + "/templates/E404.html")
  }
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
                  console.log(result3)
                  res.render(
                    __dirname + "/templates/assignment_submission.ejs",
                    {
                      course_title: result2[0].course_title,
                      assignment_description: result[0].assignment_description,
                      deadline: result[0].deadline,
                      status: result3[0].status,
                      feedback: result3[0].feedback,
                      assignment_id: req.params.assignment_id,
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
  } else {
    res.sendFile(__dirname + "/templates/login.html")
  }
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
  } else {
    res.sendFile(__dirname + "/templates/login.html")
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
  } else {
    res.sendFile(__dirname + "/templates/login.html")
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
  } else {
    res.sendFile(__dirname + "/templates/login.html")
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

app.get("/email", function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(databasename);
        dbo.collection("assignment_list").find().toArray(function (err, result) {
            var arr = []
            // console.log(result);
            for (let i = 0; i < result.length; i++) {
                var deadline = result[i].deadline;
                var today = new Date();
                deadline.setDate(deadline.getDate() - 1)
                if (deadline.getTime() > today.getTime()) {
                    arr.push(result[i].course_id);
                }
            }
            var myobj = { course_id: arr[0] };
            dbo.collection("course").find(myobj).toArray(function (err, result2) {
                var branch = result2[0].branch;
                var year = result2[0].year;
                // console.log(result2);
                var myobj2 = { branch: branch, year: year };
                dbo.collection("login").find(myobj2).toArray(function (err, result3) {
                    // console.log(result3)
                    for (let i = 0; i < result3.length; i++) {
                        var email = result3[i].email;

                        let mailTransporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'shahbazjahan5@gmail.com',
                                pass: 'cyjtqpnysfhrikbi'
                            }
                        });
                        let mailDetails = {
                            from: 'shahbazjahan5@gmail.com',
                            to: email,
                            subject: 'Test mail',
                            text: 'Gentle reminder for the students to submit the assignment with the deadline'
                        };
                        mailTransporter.sendMail(mailDetails, function (err, data) {
                            if (err) {
                                console.log('Error Occurs');
                                console.log(err);
                            } else {
                                console.log('Email sent successfully');
                            }
                        });
                    }

                    db.close;
                })
                db.close;
            })

            db.close
        })

    })
})

app.post('/assign-submission/:assignment_id', function (req, res) {
    if (req.session.loggedin && req.session.type == "student") {
        var sub = req.body.submission;
        var myobj = { assignment_id: req.params.assignment_id, student_id: req.session.username }
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            //console.log("result:: ",result)
            var dbo = db.db(databasename);
            dbo.collection("assignment_submission").updateOne(myobj, { $set: { content: sub } }, function (err, _res) {
                if (err) throw err
                console.log("1 document inserted")
                let mailTransporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'shahbazjahan5@gmail.com',
                        pass: 'cyjtqpnysfhrikbi'
                    }
                });

                let mailDetails = {
                    from: 'shahbazjahan5@gmail.com',
                    to: 'mayankgujrathi@gmail.com',
                    subject: 'Test mail',
                    text: 'you submitted your assigment'
                };
                const job = schedule.scheduleJob(Date.now(), function () {
                    // cron.schedule('* * * * * *', () => {
                    mailTransporter.sendMail(mailDetails, function (err, data) {
                        if (err) {
                            console.log('Error Occurs');
                            console.log(err);
                        } else {
                            console.log('Email sent successfully');
                        }
                    });
                    // console.log("hello worls");
                });

                res.sendFile(__dirname + '/templates/done.html');
                db.close
            })
        })
    }
    else {
        res.sendFile(__dirname + '/templates/login.html');
    }
});

app.get("/teacher-home/assignment/:assignment_id", function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(databasename);
        dbo.collection("assignment_submission").find().toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            res.render(__dirname + '/templates/teacher_subm.ejs', { result: result })
        });

    });


});


// app.get('/teacher-home', function (req, res) {
//     if (req.session.loggedin && req.session.type == "teacher") {
//         res.sendFile(__dirname + '/teacher_home.html');
//     }
//     else
//     {
//         res.sendFile(__dirname + '/templates/login.html');
//     }
// });

app.get("/check-view/:assignment_id/:student_id", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      dbo
        .collection("assignment_list")
        .find({ assignment_id: req.params.assignment_id })
        .toArray(function (err, result) {
          if (err) throw err
          console.log(result)
          dbo
            .collection("assignment_submission")
            .find({
              assignment_id: req.params.assignment_id,
              student_id: req.params.student_id,
            })
            .toArray(function (err, result2) {
              if (err) throw err
              console.log(result)
              res.render(__dirname + "/templates/check_view.ejs", {
                rollno: req.params.student_id,
                assignment_title: result[0].assignment_title,
                assignment_description: result[0].assignment_description,
                assignment_id: req.params.assignment_id,
                content: result2[0].content,
              })
            })
        })
    })
  } else {
    res.sendFile(__dirname + "/templates/login.html")
  }
})

app.post("/check-view/:assignment_id/:student_id", function (req, res) {
  if (req.session.loggedin && req.session.type == "teacher") {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(databasename)
      const myobj = {
        assignment_id: req.params.assignment_id,
        student_id: req.params.student_id,
      }
      dbo.collection("assignment_submission").updateOne(
        myobj,
        {
          $set: {
            grade: req.body.grade,
            feedback: req.params.feedback,
            status: "graded",
          },
        },
        function (err, _res) {
          if (err) throw err
          res.redirect(`/teacher-home/assignment/${req.params.assignment_id}`)
        }
      )
    })
  } else {
    res.sendFile(__dirname + "/templates/login.html")
  }
})

app.use((req, res, next) => {
    res.status(404).sendFile(__dirname+"/templates/E404.html")
})

app.listen(3000, function () {
  console.log("app listening on port 3000!")
})
