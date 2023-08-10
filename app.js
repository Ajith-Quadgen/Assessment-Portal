const express = require('express');
const session = require('express-session');
const db = require('./DataBaseConnection')
const queryString = require('querystring');
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const { userInfo } = require('os');
var dateTime = require('node-datetime');
const { Server } = require('socket.io');
const { render } = require('ejs');
const { Socket } = require('dgram');
const { Console, error } = require('console');
const multer = require('multer');
const router = express.Router();

const DateTime = require('node-datetime/src/datetime');
const { restart } = require('nodemon');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}`));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'XCR3rsasa%RDHHH',
  cookie: { maxAge: 86400000 }
}));

//Router Config
const api_router = require('./routes/api');
const trainer_router = require('./routes/trainer');
const employee_router = require('./routes/employee');
const admin_router = require('./routes/admin');
app.use('/api', api_router);
app.use('/Trainer', trainer_router);
app.use('/Employee', employee_router);
app.use('/Admin', admin_router);


//Setting up Storage Area
const myStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    var uploadDir = "./public/uploads/Trainer";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  }, filename: function (req, file, cb) {
    cb(null, req.session.UserID + '_' + file.originalname + '_' + Date.now() + path.extname(file.originalname));
  }
});
const myFileFilter = (req, file, error) => {
  if (file.mimetype.split("/")[1] === "pdf" || file.mimetype.split("/")[1] === "jpg") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};
const upload = multer({ storage: myStorage, limits: { fileSize: 500000 } }).single("myQCImage");

app.post('/uploadImage', (req, res) => {
  if (req.session.UserID) {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.send(res.req.file.filename);
    }
  });
}else{
  res.status(400).send("Access Denied")
}
});


db.connect((error) => {
  if (error) {
    console.error('Failed to connect to MySQL database:', error);
  } else {
    console.log('Connected to MySQL database!');
  }
});


const port = 4000;
const host = "172.17.1.22"
const server = app.listen(port, function () {
  console.log("App is listening at http://localhost:%s", port);
});



let dt = dateTime.create();
let CurrentDate = dt.format('Y-m-d H:M:S');

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.post('/submit-questionnaire', (req, res) => {
  if (req.session.UserID) {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz1234567890";
  let lenString = 30;
  let randomString = '';
  for (let i = 0; i < lenString; i++) {
    let rnum = Math.floor(Math.random() * characters.length);
    randomString += characters.substring(rnum, rnum + 1);
  }
  //console.log(req.body.JsonFormData);
  const FormData = JSON.parse(req.body.JsonFormData);
  const questionnaire = JSON.stringify(FormData);
  let inputData = {
    "AssessmentName": FormData.Title,
    "Description": FormData.Description,
    "Questionnaire": questionnaire,
    "MaximumScore": FormData.TotalScore,
    "Duration": FormData.Duration,
    "CreatedOn": CurrentDate,
    "CreatedBy": req.session.UserID,
    "AssesmentKey": randomString
  };
  db.query("Insert into assessments set?", [inputData], function (error, result) {
    if (error) throw error
    else
      return res.redirect('/Trainer');
  });
}else{
  res.status(400).send("Access Denied")
}
});



app.post('/oldVerifyAssessmentKey', (req, res) => {
  let jsonData, queryData;
  db.query("select * from assessments where AssesmentKey=? and Status='Published'", [req.body.AssesmentKey], function (error, result) {
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      db.query("Select * from responces where employeeid=? and AssessmentID=?", [req.session.UserID, result[0].AssessmentID], function (error, result1) {
        if (error) throw error
        if (result1.length > 0) {
          queryData = queryString.stringify({
            message: Buffer.from("You have already Appeared for this Assessment.If not contact your Trainer.").toString('base64')
          });
          db.query("SELECT * FROM repeatrequest where assessmentkey=? and userID=? and status!='Approved'", [req.body.AssesmentKey, req.session.UserID], function (err, result2) {
            if (err) throw err
            if (result2.length > 0) {
              console.log(result2);
              queryData = queryString.stringify({
                message: Buffer.from("You request is not yet approved by your trainer.Please try after sometime.").toString('base64')
              });
              res.redirect('/Employee?' + queryData);
            } else {
              res.render('Employees/takeAssessment', { jsonData: jsonData, "result": result[0], message: null });
            }
          });

        } else {
          res.render('Employees/takeAssessment', { jsonData: jsonData, "result": result[0], message: null });
        }
      });
    } else {
      const queryData = queryString.stringify({
        message: Buffer.from("Invalid Assessment Key").toString('base64')
      });
      res.redirect('/Employee?' + queryData);
    }
  });
})

app.post('/ExamHall', (req, res) => {
  if (req.session.UserID) {
  let jsonData, queryData;
  db.query("select * from assessments where AssesmentKey=? and Status='Published'", [req.body.AssesmentKey], function (error, result) {
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      db.query("select R.idresponces,R.AssessmentID,R.employeeid,RR.id,RR.assessmentkey,RR.userID,RR.trainerid,RR.status from responces as R,repeatrequest as RR where RR.userID=? and RR.assessmentkey=? and RR.userID=R.employeeid and RR.status!='Approved';", [req.session.UserID, req.body.AssesmentKey], function (error, result1) {
        if (error) throw error
        if (result1.length > 0) {
          queryData = queryString.stringify({
            message: Buffer.from("You have already Appeared for this Assessment.If not contact your Trainer.").toString('base64')
          });
          res.redirect('/Employee?' + queryData);
          // db.query("SELECT * FROM repeatrequest where assessmentkey=? and userID=? and status!='Approved'", [req.body.AssesmentKey, req.session.UserID], function (err, result2) {
          //   if (err) throw err
          //   if (result2.length > 0) {
          //     console.log(result2);
          //     queryData = queryString.stringify({
          //       message: Buffer.from("You request is not yet approved by your trainer.Please try after sometime.").toString('base64')
          //     });
          //     res.redirect('/Employee?' + queryData);
          //   } else {
          //     res.render('Employees/takeAssessment', { jsonData: jsonData, "result": result[0], message: null });
          //   }
          // });

        } else {
          res.render('Employees/takeAssessment', { jsonData: jsonData, "result": result[0], message: null });
        }
      });
    } else {
      const queryData = queryString.stringify({
        message: Buffer.from("Invalid Assessment Key").toString('base64')
      });
      res.redirect('/Employee?' + queryData);
    }
  });
}else{
  res.status(400).send("Access Denied");
}
})

app.get('/login', (req, res) => {
  if (req.session.UserID) {
    switch (req.session.UserRole) {
      case "Employee":
        res.redirect('/Employee');
        break;
      case "Trainer":
        res.redirect('/Trainer');
        break;
      case "Admin":
        res.redirect('/Admin');
        break;
      default:
        res.render('login');
        break;
    }
  } else {
    res.render('login');
  }
});

app.post('/AuthenticateLogin', (req, res) => {
  var UserInfo = req.body;
  db.query("select * from userlogin where empId=? or email=? and password=? and status", [UserInfo.email, UserInfo.email, UserInfo.password], function (error, result) {
    if (error) throw error;
    if (result.length > 0) {
      db.query("update userlogin set lastSeen=? where empId=?", [CurrentDate, result[0].empId], function (error, result) {
        if (error) throw error;
      });
      req.session.UserID = result[0].empId;
      req.session.UserRole = result[0].role;
      if (result[0].role == "Employee") {
        res.redirect('/Employee');
      } else if (result[0].role == "Trainer") {
        res.redirect('/Trainer');
      } else if (result[0].role == "Admin") {
        res.redirect('/Admin');
      } else {
        return res.send("Internal Server Error");
      }
    } else {
      return res.redirect('/login');
    }
  })
});

app.post('/submit-assessment', (req, res) => {
  if (req.session.UserID) {
    const answerScript = JSON.parse(req.body.JsonFormData);
    db.query("Select * from assessments where AssessmentID=? and AssesmentKey=?", [req.body.AssessmentID, req.body.AssessmentKey], function (error, result) {
      if (error) throw error;
      const Questionnaire = JSON.parse(result[0].Questionnaire);
      var Result = {};
      let totalScore = 0;
      for (const sectionName in Questionnaire) {
        if (sectionName.startsWith('Section')) {
          const section = Questionnaire[sectionName];
          const answers = answerScript[sectionName];
          let sectionScore = 0;
          for (const questionName in section) {
            if (questionName !== 'MaxScore') {
              const question = section[questionName];
              const answer = answers[questionName];
              if (answer && answer.correctOption === question.answer) {
                sectionScore += parseInt(question.point);
              }
            }
          }

          Result[sectionName] = sectionScore;
          console.log("section Score:", sectionScore);
          totalScore += sectionScore;
        }
      }
      let resultLabel;
      var cutOff = parseInt(Questionnaire['Cutoff']);
      var maxMarks = parseInt(Questionnaire['TotalScore']);
      var currentPercentage = ((totalScore / maxMarks) * 100).toFixed(0);
      Result.SecuredPercentage = currentPercentage;
      var message = "";
      if (currentPercentage >= cutOff) {
        resultLabel = "Cleared";
        message = "Congratulations You Passed with FLying Colours";
      } else {
        resultLabel = "Not Cleared"
        message = "Unfortunately, you have not met the passing criteria for the exam.";
      }
      Result.TotalScore = totalScore;
      Result.Message = message;
      Result.Result = resultLabel;
      const inputData = {
        AssessmentID: req.body.AssessmentID,
        answerscript: JSON.stringify(answerScript),
        obtainedmarks: JSON.stringify(Result),
        employeeid: req.session.UserID,
        date: CurrentDate,
        remarks: req.body.AssessmentRemarks,
        Result:resultLabel
      };
      db.query('INSERT INTO responces  set?', [inputData], function (error1, result1) {
        if (error1) throw error1
        db.query("Update repeatrequest set status=IF(status='Approved','Appeared',status) where (userID=? and assessmentkey=?)",[req.session.UserID,req.body.AssessmentKey],(error2,result2)=>{
          if(error2) throw error2
        });
      });
      res.render('Employees/Result', { Result: Result });
    });
  } else {
    res.redirect('/login');
  }
});


app.get('/Error', (req, res) => {
  res.render('error');
});
app.get('/changePassword',(req,res)=>{
  if (req.session.UserID) {
    res.render('ChangePassword')
  }else{
    res.redirect('/login');
  }
});

app.get('*', (req, res) => {
  //res.redirect('/login');
  res.status(400).send("Page Not Found");
});
function formatDateString(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}