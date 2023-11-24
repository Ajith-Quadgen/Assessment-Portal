const express = require('express');
const admin_router = express.Router()
const db = require('../DataBaseConnection')
function getTimeStamp() {
  return (new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));
}
admin_router.get('/', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Admin") {
    let count, total = 0;
    db.query("SELECT role,count(*) as Count FROM assessment.userlogin group by role order by Count Desc", function (error, result1) {
      count = result1;
      result1.forEach(row => {
        total += row.Count
      })
    });
    db.query('select *,date_format(CreatedOn,"%d-%b-%y/%r") as newCreatedDate,date_format(LastUpdate,"%d-%b-%y/%r") as newModifiedDate from assessments', function (error, result) {
      if (error) throw error
      res.render('../views/admin/adminHome', { data: result, count: count, Total: total, Role: req.session.UserRole, title: "Admin Dashboard" });
    })
  } else {
    res.redirect('/login');
  }
})
admin_router.get('/viewAssessments', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Admin") {
    let ConsolidatedInfo = [];
    let result = {};
    db.query('select *,date_format(CreatedOn,"%d-%b-%y/%r") as newCreatedDate,date_format(LastUpdate,"%d-%b-%y/%r") as newModifiedDate from assessments',function (error, resultOne) {
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
            result.CreatedDate =record.newCreatedDate;
            result.ModifiedDate =record.newModifiedDate;
            result.Duration = record.Duration;
            result.AssessmentKey = record.AssesmentKey;
            result.MaximumScore = record.MaximumScore;
            result.ResponseCount = resultTwo[0].ResponseCount;
            result.status = record.Status;
            ConsolidatedInfo.push(result);
            counter++;
            if (counter === resultOne.length) {
              res.render('../views/admin/viewAssessment', { data: ConsolidatedInfo, Role: req.session.UserRole, title: "Assessments" });
            }
          });
        });
      } else {
        res.render('../views/admin/viewAssessment', { data: ConsolidatedInfo, Role: req.session.UserRole, title: "Assessments" });
      }
    });
  } else {
    res.redirect('/login');
  }
})
admin_router.get("/viewUsers", (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Admin") {
    db.query('Select *,date_format(lastSeen,"%d-%b-%y/%r") as newLastSeen from userlogin where role!="Admin"  order by employeeName', (error, result) => {
      if (error) {
        console.log(error)
        res.status(400).send("Internal Server Error");
      }
      res.render('../views/admin/viewUser', { Data: result, Role: req.session.UserRole, title: "Users" });
    });
  } else {
    res.redirect('/login');
  }
})
admin_router.post('/addUser', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Admin") {
    db.query("Select * from userlogin where empId=? or email=?", [req.body.empId, req.body.email], (err, result) => {
      if (err) throw err
      if (result.length > 0) {
        res.redirect('/Admin/viewUsers?Message=Employee Already Exists.');
      } else {
        db.query("insert into userlogin set?", [req.body], (error, result1) => {
          if (error) throw error
          res.redirect('/Admin');
        })
      }
    })
  } else {
    res.redirect('/login');
  }
});
admin_router.get("*", (req, res) => {
  res.redirect('/')
})
function formatDateString(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}
module.exports = admin_router