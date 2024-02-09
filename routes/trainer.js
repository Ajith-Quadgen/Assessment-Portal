const express = require('express');
const trainer_router = express.Router()
const db = require('../DataBaseConnection')
function getTimeStamp() {
  return (new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));
}
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
            result.status = record.Status;
            ConsolidatedInfo.push(result);
            counter++;
            if (counter === resultOne.length) {
              res.render('../views/Trainer/TrainerHome', { data: ConsolidatedInfo, Role: req.session.UserRole, title: "QG-Assessment Portal" });
            }
          });
        });
      } else {
        res.render('../views/Trainer/TrainerHome', { data: ConsolidatedInfo, Role: req.session.UserRole, title: "QG-Assessment Portal" });
      }
    });
  } else {
    res.redirect('/login');
  }
});

trainer_router.get('/CreateAssessment', (req, res) => {
  if (req.session.UserID) {
    res.render("../views/Trainer/create_assessment", { Role: req.session.UserRole, title: "Create Assessment" });
  } else {
    res.redirect('/Trainer');
  }
});


trainer_router.get('/viewAssessment', (req, res) => {
  let jsonData;
  db.query("SELECT * FROM assessments where CreatedBy=? and AssesmentKey=?", [req.session.UserID, req.query.AssesmentKey], function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      res.render("../views/Trainer/view_assessment", { jsonData: jsonData, "result": result[0], message: null, Role: req.session.UserRole, title: "View Assessment" });
    } else {
      res.redirect('/Trainer');
    }
  })
});

trainer_router.get('/editAssessment', (req, res) => {
  let jsonData;
  db.query("SELECT * FROM assessments where CreatedBy=? and AssesmentKey=? and Status='Draft'", [req.session.UserID, req.query.AssesmentKey], function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      res.render("../views/Trainer/EditAssessment", { jsonData: jsonData, "result": result[0], message: null, Role: req.session.UserRole, title: "Edit Assessment" });
    } else {
      res.redirect(`/Trainer/ViewAssessment?AssesmentKey=${req.query.AssesmentKey}`);
    }
  })
});

trainer_router.get('/trashAssessment', (req, res) => {
  let jsonData;
  db.query("update assessments set Status='Revoked' where CreatedBy=? and AssesmentKey=?", [req.session.UserID, req.query.AssesmentKey], function (err, result) {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.redirect(`/Trainer?Message="Assessment Successfully Moved to Trash"`);
    } else {
      res.redirect(`/Trainer?Message="Something Went Wrong while Moving Assessment to Trash`);
    }
  })
});

trainer_router.get('/viewResponces', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Admin") {
    let ConsolidatedResponces = [];
    let result = {};
    db.query("select *,date_format(date,'%d-%b-%y/%r') as newSubmittedDate from responces where AssessmentID=?", [req.query.AssessmentID], function (error, resultOne) {
      if (error) throw error;
      if (resultOne.length > 0) {
        let counter = 0;
        resultOne.forEach(record => {

          db.query("select * from userlogin where empId=?", [record.employeeid], function (error, resultTwo) {
            if (error) throw error;
            result = {};
            if(resultTwo.length){
              result.SubmittedDate = record.newSubmittedDate;
              let temp = JSON.parse(record.obtainedmarks);
              result.ID = record.idresponces;
              result.EmployeeName = resultTwo[0].employeeName;
              result.SecuredMarks = temp.TotalScore;
              result.SecuredPercentage = temp.SecuredPercentage;
              result.Result = temp.Result;
              result.Report = record.report;
              result.certificate = record.certificate;
              if (record.remarks) {
                result.Remarks = record.remarks;
              } else {
                result.Remarks = "";
              }
              ConsolidatedResponces.push(result);
              
            }
            counter++;
            if (counter === resultOne.length) {
              res.render("../views/Trainer/ResponseDashboard", { Data: ConsolidatedResponces, AssID: req.query.AssessmentID, Role: req.session.UserRole, title: "Assessment Responses" });
            }
          });
        });
      } else {
        res.render("../views/Trainer/ResponseDashboard", { Data: ConsolidatedResponces, AssID: "", Role: req.session.UserRole, title: "Assessment Responses" });
      }
    });
  } else {
    res.redirect('/login');
  }
});

trainer_router.get('/Reappear-Request', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    db.query("Select R.status,R.id,R.message,date_format(R.requestdate,'%D-%M-%Y') as Requestdate,E.employeeName,A.AssessmentName from repeatrequest R,assessments A,userlogin E where R.trainerid=? and R.userID=E.empId and R.assessmentkey=A.AssesmentKey order by R.requestdate", [req.session.UserID], (error, result) => {
      if (error) {
        console.log(error)
        res.status(400).send("Internal Server Error");
      }
      res.render('../views/Trainer/RepeatRequest', { Data: result, flag: true, Role: req.session.UserRole, title: "Re-Appearing Request" });
    });
  } else {
    res.redirect('/login');
  }
});

trainer_router.get('/viewProgress', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    db.query("SELECT A.*,U.employeeName,Asmt.AssessmentName,date_format(A.Start_Time,'%d-%b-%y/%r') as S_Date,date_format(A.End_Time,'%d-%b-%y/%r') as E_Date  FROM assessment_session A, userlogin U,assessments Asmt  where A.Assessment_ID=? and A.User_ID=U.empId and Asmt.AssesmentKey=A.Assessment_ID;", [req.query.AssesmentKey], (error, result) => {
      if (error) {
        console.log(error)
        return res.status(400).send("Internal Server Error");
      }
      return res.render('../views/Trainer/Progress', { Data: result, Role: req.session.UserRole, title: "Assessment Progress" });
    });
  } else {
    return res.redirect('/login');
  }
});



trainer_router.get('/TakeAssessment', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    let message;
    if (req.query.message != undefined && req.query.message != "") {
      message = req.query.message;
      res.render('../views/Employees/EmployeeHome', { message: message, Role: req.session.UserRole, title: "QG-Assessment Portal" });
    } else {
      res.render('../views/Employees/EmployeeHome', { message: null, Role: req.session.UserRole, title: "QG-Assessment Portal" });
    }
  } else {
    res.redirect('/login');
  }
})
trainer_router.post('/updateAssessment', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    const FormData = JSON.parse(req.body.JsonFormData);
    const questionnaire = JSON.stringify(FormData);
    db.query('update assessments set AssessmentName=?,Description=?, Questionnaire=?,MaximumScore=?,Duration=?,LastUpdate=?,Certificate_Name=? where AssessmentID=? and AssesmentKey=? and CreatedBy=?', [FormData.Title, FormData.Description, questionnaire, FormData.TotalScore, FormData.Duration, getTimeStamp(), req.body.AssessmentCertificateName, req.body.AssessmentID, req.body.AssessmentKey, req.session.UserID], (error, result) => {
      if (error) {
        console.log(error)
      } else {
        if (result.affectedRows > 0) {
          res.redirect(`/Trainer/viewAssessment?AssesmentKey=${req.body.AssessmentKey}`)
        }
      }
    })
  } else {
    res.json({ Message: "Access Denied" })
  }
})

trainer_router.get("*", (req, res) => {
  res.redirect('/')
})
function formatDateString(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}
module.exports = trainer_router