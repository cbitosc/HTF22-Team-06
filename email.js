app.get("/email", function (req, res) {
    MongoClient.connect(url, function (err, db) {
  
      if (err) throw err;
      var dbo = db.db(databasename);
      dbo.collection("course").find().toArray(function (err, result) {
        if (err) throw err;
        //console.log(result);
        d = {}
        final = {}
        users = {}
        for (let i = 0; i < result.length; i++) {
          d[result[i].course_id] = [];
        }
        dbo.collection("assignment_list").find().toArray(function (err, res) {
          console.log(res);
          for (let i = 0; i < res.length; i++) {
            console.log(res[i].course_id);
            key1 = res[i].assignment_id;
            value = res[i].deadline
            final[key1] = value;
          }
          //console.log("final: ",final);
          dbo.collection("assignment_submission").find().toArray(function (err, output) {
            console.log(output);
  
            if (err) throw err;
            for (let i = 0; i < output.length; i++) {
              users[output[i].assignment_id] = []
              users[output[i].assignment_id].push(output[i].student_id);
  
  
            }
            console.log("users: ", users)
            console.log(final)
            for (let key in final) {
              if (final.hasOwnProperty(key)) {
                var value = final[key]
                //  const va=value.split("T");
                console.log("user enetered: ", value)
                value.setDate(value.getDate() - 1);
                var today = new Date()
                console.log("User: ", value.getDate())
                console.log(value.getDate() == today.getDate())
                if (value.getDate() == today.getDate() && value.getMonth == today.getMonth() && value.getYear() == today.getYear()) {
                  MongoClient.connect(url, function (err, db) {
                    c
                    if (err) throw err;
                    //console.log("result:: ",result)
                    var dbo = db.db(databasename);
                    for (let i = 0; i < users[key].length; i++) {
  
                      query = { "username": users[key][i] }
                      dbo.collection("login").find(query).toArray(function (err, ou) {
                        if (err) throw err;
                        console.log(ou)
                        var mail = ou.email;
                        console.log("Mail: ", mail);
                        let mailDetails = {
                          from: 'shahbazjahan5@gmail.com',
                          to: mail,
                          subject: 'ASSIGMENT SUBMISSION REMAINDER',
                          text: "Submit the assignment "
                        };
  
                        mailTransporter.sendMail(mailDetails, function (err, data) {
                          if (err) {
                            console.log('Error Occurs');
                            console.log(err);
                          } else {
                            console.log('Email sent successfully');
                          }
                        });
  
                      });
                    }
                  });
                }
              }
            }
          });
        });
      });
    });
  });
  