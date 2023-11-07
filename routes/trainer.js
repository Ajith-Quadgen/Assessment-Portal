const express = require('express');
const trainer_router = express.Router()
const db=require('../DataBaseConnection')

trainer_router.get('/', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    let ConsolidatedInfo = [];
    let result = {};
    db.query("select * from assessments where CreatedBy=?", [req.session.UserID], function (error, resultOne) {
      if (error) throw error
      if (resultOne.length > 0) {
        let counter = 0;
        resultOne.forEach(record => {
          db.query('select count(*) as ResponseCount from responces where  AssessmentID=?', [record.AssessmentID], function (error, resultTwo) {
            if (error) throw error
            result = {};
            result.AssessmentID = record.AssessmentID;
            result.AssessmentName = record.AssessmentName;
            result.Description = record.Description;
            result.AssessmentDate = formatDateString(record.AssessmentDate);
            result.Duration = record.Duration;
            result.AssesmentKey = record.AssesmentKey;
            result.MaximumScore = record.MaximumScore;
            result.ResponseCount = resultTwo[0].ResponseCount;
            result.status=record.Status;
            ConsolidatedInfo.push(result);
            counter++;
            if (counter === resultOne.length) {
              res.render('../views/Trainer/TrainerHome', { data: ConsolidatedInfo });
            }
          });
        });
      } else {
        res.render('../views/Trainer/TrainerHome', { data: ConsolidatedInfo });
      }
    });
  } else {
    res.redirect('/login');
  }
});

trainer_router.get('/CreateAssessment', (req, res) => {
  if (req.session.UserID) {
    res.render("../views/Trainer/create_assessment");
  } else {
    res.redirect('/login');
  }
});


trainer_router.get('/viewAssessment', (req, res) => {
  let jsonData;
  db.query("SELECT * FROM assessments where CreatedBy=? and AssesmentKey=?", [req.session.UserID, req.query.AssesmentKey], function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      res.render("../views/Trainer/view_assessment", { jsonData: jsonData, "result": result[0], message: null });
    } else {
      res.redirect('/error');
    }
  })
});

trainer_router.get('/editAssessment', (req, res) => {
  let jsonData;
  db.query("SELECT * FROM assessments where CreatedBy=? and AssesmentKey=?", [req.session.UserID, req.query.AssesmentKey], function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      res.render("../views/Trainer/EditAssessment", { jsonData: jsonData, "result": result[0], message: null });
    } else {
      res.redirect('/error');
    }
  })
});

trainer_router.get('/viewResponces', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Admin") {
    let ConsolidatedResponces = [];
    let result = {};
    db.query("select * from responces where AssessmentID=?", [req.query.AssessmentID], function (error, resultOne) {
      if (error) throw error;
      if (resultOne.length > 0) {
        let counter = 0;
        resultOne.forEach(record => {
          db.query("select * from userlogin where empId=?", [record.employeeid], function (error, resultTwo) {
            if (error) throw error;
            result = {};
            result.SubmittedDate = formatDateString(record.date);
            let temp = JSON.parse(record.obtainedmarks);
            result.ID=record.idresponces;
            result.EmployeeName = resultTwo[0].employeeName;
            result.SecuredMarks = temp.TotalScore;
            result.SecuredPercentage = temp.SecuredPercentage;
            result.Result = temp.Result;
            result.Report=record.report;
            if (record.remarks) {
              result.Remarks = record.remarks;
            } else {
              result.Remarks = "";
            }
            ConsolidatedResponces.push(result);
            counter++;
            if (counter === resultOne.length) {
              res.render("../views/Trainer/ResponseDashboard", { Data: ConsolidatedResponces,AssID:req.query.AssessmentID });
            }
          });
        });
      } else {
        res.render("../views/Trainer/ResponseDashboard", { Data: ConsolidatedResponces,AssID:"" });

      }

    });
  } else {
    res.redirect('/login');
  }
});

trainer_router.get('/Reappear-Request',(req,res)=>{
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    db.query("Select R.status,R.id,R.message,date_format(R.requestdate,'%D-%M-%Y') as Requestdate,E.employeeName,A.AssessmentName from repeatrequest R,assessments A,userlogin E where R.trainerid=? and R.userID=E.empId and R.assessmentkey=A.AssesmentKey order by R.requestdate",[req.session.UserID],(error,result)=>{
      if(error){
        console.log(error)
        res.status(400).send("Internal Server Error");
      }
        res.render('../views/Trainer/RepeatRequest',{Data:result,flag:true});
    });
  }else{
    res.redirect('/login');
  }
});

trainer_router.get('/TakeAssessment',(req,res)=>{
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    let message;
    if (req.query.message != undefined && req.query.message != "") {
      message = req.query.message;
      res.render('../views/Trainer/T_ExamHall', { message: message,user:"Trainer" });
    } else {
      res.render('../views/Trainer/T_ExamHall', { message: null,user:"Trainer" });
    }
  } else {
    res.redirect('/login');
  }
})

trainer_router.get("*",(req,res)=>{
  res.status(404).send("Invalid Request")
})
function formatDateString(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}
module.exports = trainer_router