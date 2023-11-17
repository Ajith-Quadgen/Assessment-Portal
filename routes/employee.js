const express = require('express');
const employee_router = express.Router()
const db=require('../DataBaseConnection')

employee_router.get('/', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Employee") {
      let message;
      if (req.query.message != undefined && req.query.message != "") {
        message = req.query.message;
        res.render('../views/Employees/EmployeeHome', { message: message,Role:req.session.UserRole,title:"QG-Assessment Portal" });
      } else {
        res.render('../views/Employees/EmployeeHome', { message: null,Role:req.session.UserRole,title:"QG-Assessment Portal" });
      }
    } else {
      res.redirect('/login');
    }
  });

  employee_router.get("/viewResultBoard", (req, res) => {
    if (req.session.UserID) {
      let ConsolidatedResult = [];
      let result = {};
      db.query("select * from responces where employeeid=?", [req.session.UserID], function (error, resultOne) {
        if (error) throw error
        if (resultOne.length > 0) {
          let counter = 0;
          resultOne.forEach(record => {
            db.query("select * from assessments where AssessmentID=?", [record.AssessmentID], function (error, resultTwo) {
              if (error) throw error;
              result = {};
              result.Date = formatDateString(record.date);
              result.AssessmentName = resultTwo[0].AssessmentName;
              result.TotalScore = resultTwo[0].MaximumScore;
              let temp = JSON.parse(resultTwo[0].Questionnaire);
              result.cutOff = temp.Cutoff;
              temp = JSON.parse(record.obtainedmarks);
              result.SecuredMarks = temp.TotalScore;
              result.Message = temp.Message;
              result.remarks = record.remarks;
              result.Result = temp.Result;
              result.percentage = temp.SecuredPercentage;
              result.detailedResult = record.obtainedmarks;
              result.certificate=record.certificate;
              ConsolidatedResult.push(result);
              counter++;
              if (counter === resultOne.length) {
                res.render("../views/Employees/ResultBoard", { Data: ConsolidatedResult,Role:req.session.UserRole,title:"Result Board" });
              }
            });
          });
        } else {
          res.render("../views/Employees/ResultBoard", { Data: ConsolidatedResult,Role:req.session.UserRole,title:"Result Board" });
        }
      });
    } else {
      res.redirect('/login');
    }
  });
  
  employee_router.get("*",(req,res)=>{
    res.redirect('/')
  })
  function formatDateString(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = date.toLocaleString('en-US', options);
    return formattedDate;
  }
module.exports=employee_router