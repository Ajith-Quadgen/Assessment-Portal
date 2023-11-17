const express = require('express');
const admin_router = express.Router()
const db=require('../DataBaseConnection')

admin_router.get('/', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Admin") {
      let count, employee, admin, trainer;
      db.query("select count(*) as totalUser from userlogin", function (error, result1) {
        count = result1[0].totalUser;
      });
      db.query("select count(*) as noofemployee from userlogin where role='Employee'", function (error, result1) {
        employee = result1[0].noofemployee;
      });
      db.query("select count(*) as nooftrainer from userlogin where role='Trainer'", function (error, result1) {
        trainer = result1[0].nooftrainer;
      });
      db.query("select count(*) as noofadmin from userlogin where role='Admin'", function (error, result1) {
        admin = result1[0].noofadmin;
      });
      db.query("select * from assessments", function (error, result) {
        if (error) throw error
        res.render('../views/admin/adminHome', { data: result, TotalCount: count, employeecount: employee, trainercount: trainer, admincount: admin,Role:req.session.UserRole,title:"Admin Dashboard" });
      })
    } else {
      res.redirect('/login');
    }
  })
admin_router.get("/viewUsers",(req,res)=>{
  if (req.session.UserID && req.session.UserRole == "Admin") {
    db.query("Select * from userlogin",(error,result)=>{
      if(error){
        console.log(error)
        res.status(400).send("Internal Server Error");
      }
        res.render('../views/admin/viewUser',{Data:result,Role:req.session.UserRole,title:"Users"});
    });
  } else {
      res.redirect('/login');
    }
})
admin_router.get("/addUser",(req,res)=>{
  if (req.session.UserID && req.session.UserRole == "Admin") {
res.render("../views/admin/AddUser",{Role:req.session.UserRole,title:"Users"});
  }else{
    res.redirect('/login');
  }
});
admin_router.post('/addUser',(req,res)=>{
  if (req.session.UserID && req.session.UserRole == "Admin") {
    db.query("Select * from userlogin where empId=? or email=?",[req.body.empId,req.body.email],(err,result)=>{
      if(err) throw err
      if(result.length>0){
        res.status(400).send("Employee Already Exists.")
      }else{
        db.query("insert into userlogin set?",[req.body],(error,result1)=>{
          if(error) throw error
          res.redirect('/login');
        })
      }
    })
  }else{
    res.redirect('/login');
  }
});
  admin_router.get("*",(req,res)=>{
    res.redirect('/')
  })
  function formatDateString(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = date.toLocaleString('en-US', options);
    return formattedDate;
  }
module.exports=admin_router