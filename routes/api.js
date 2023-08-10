const express = require('express');
const api_router = express.Router()
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const db = require('../DataBaseConnection')
const crypto = require('crypto');
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
api_router.post('/PublishAssessment', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Admin") {
        db.query("update assessments set Status='Published' where AssessmentID=? and AssesmentKey=? and CreatedBy=?", [req.body.params.Id, req.body.params.key, req.session.UserID], (err, result) => {
            if (err) throw err
            if (result.changedRows > 0) {
                res.status(200).send("Published Successfully");
            }
        })
    } else {
        res.status(400).send("Access Denied.")
    }
})
api_router.get('/AssessmentDetails', (req, res) => {
    if (req.session.UserID) {
        db.query("select * from assessments where AssesmentKey=? and Status='Published'", [req.query.AssesmentKey], function (error, result) {
            if (error) throw error
            if (result.length > 0) {
                db.query("select * from responces R,assessments A where R.employeeid=? and R.AssessmentID=A.AssessmentID and A.AssesmentKey=? and R.Result='Not Cleared'", [req.session.UserID, req.query.AssesmentKey], (error1, result1) => {
                    if (error1) throw error1
                    if (result1.length > 0) {
                        db.query("select * from repeatrequest where userID=? and assessmentkey=? and status='Approved'", [req.session.UserID, req.query.AssesmentKey], (error2, result2) => {
                            if (error2) throw error2
                            if (result2.length > 0) {
                                db.query("select A.AssessmentName,A.Description,A.Duration,A.MaximumScore,A.CreatedBy,U.employeeName,U.role from assessments as A join userlogin as U where A.AssesmentKey=? and A.Status='Published' and A.CreatedBy=U.empId and A.CreatedBy!=? ", [req.query.AssesmentKey, req.session.UserID], function (error3, result3) {
                                    if (error3) throw error3
                                    if (result3.length > 0) {
                                        res.status(200).send(result3[0]);
                                    } else {
                                        res.status(404).send("Assessment Not Found");
                                    }
                                });
                            } else {
                                res.status(400).send("You have already appeared for this assessment. If you want to retake the assessment raise a request to your Trainer");
                            }
                            //res.status(400).send("You have already submitted an Reappear request. You cant raise new request.")

                        })
                    } else {
                        db.query("select A.AssessmentName,A.Description,A.Duration,A.MaximumScore,A.CreatedBy,U.employeeName,U.role from assessments as A join userlogin as U where A.AssesmentKey=? and A.Status='Published' and A.CreatedBy=U.empId and A.CreatedBy!=? ", [req.query.AssesmentKey, req.session.UserID], function (error3, result3) {
                            if (error3) throw error3
                            if (result3.length > 0) {
                                res.status(200).send(result3[0]);
                            } else {
                                res.status(404).send("Assessment Not Found");
                            }
                        });
                    }
                })
            } else {
                res.status(400).send("Invalid Assessment Key.")
            }
        });
    } else {
        res.status(401).send("Access Denied");
    }
});

api_router.post('/uploadImage', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        } else {
            res.send(res.req.file.filename);
        }
    });
});
api_router.get('/reattempt-request', (req, res) => {
    if (req.session.UserID) {
        db.query("select * from responces R,assessments A where R.employeeid=? and A.AssessmentID=R.AssessmentID and A.AssesmentKey=? and R.Result='Cleared'", [req.session.UserID, req.query.key], (error, result0) => {
            if (error) throw error
            if (result0.length == 0) {
                db.query("select * from repeatrequest where assessmentkey=? and UserID=? and  status not in ('Rejected','Appeared')", [req.query.key, req.session.UserID], (err, result1) => {
                    if (err) {
                        res.status(400).send("Internal server error");
                    }
                    if (result1.length > 0) {
                        res.status(400).send("A Request for this Assessment is already submitted\nYou can't submit new request.")
                    } else {
                        db.query("select A.CreatedBy,U.employeeName from assessments as A join userlogin as U where A.AssesmentKey=? and A.CreatedBy=U.empId ", [req.query.key], function (error, result2) {
                            if (error) {
                                res.status(400).send("Internal server error")
                            }
                            else if (result2.length > 0) {
                                let inputData = {
                                    "assessmentkey": req.query.key,
                                    "message": req.query.msg,
                                    "trainerid": result2[0].CreatedBy,
                                    "UserID": req.session.UserID
                                }
                                db.query("Insert into repeatrequest  set?", [inputData], function (err, result3) {
                                    if (err)
                                        res.status(400).send("Internal server error");
                                    else
                                        res.status(200).send("Success")
                                });
                            } else {
                                res.status(400).send("Internal Server Error");
                            }
                        });
                    }
                })
            } else {
                res.status(400).send("You Have Not Yet Appeared for This Assessment, You can't submit reattempt request.")
            }
        })
    } else {
        res.status(401).send("Access Denied");
    }
});

api_router.post('/update-reattempt-request', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Admin") {
        db.query("update repeatrequest set status=? where id=?", [req.body.params.status, req.body.params.id], (err, result) => {
            if (err)
                res.status(400).send("Internal Server Error");
            if (result.changedRows > 0) {
                db.query("Select R.status,R.id,R.message,date_format(R.requestdate,'%D-%M-%Y') as Requestdate,E.employeeName,A.AssessmentName from repeatrequest R,assessments A,userlogin E where R.trainerid=? and R.userID=E.empId and R.assessmentkey=A.AssesmentKey order by R.requestdate", [req.session.UserID], (error, result) => {
                    if (error) {
                        console.log(error)
                        res.status(400).send("Internal Server Error");
                    }
                    res.status(200).send(result);
                });
            }
        })
    } else {
        res.status(401).send("Access Denied");
    }
});
api_router.post("/UpdatePassword", (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Employee") {
        db.query("update userlogin set password=? where empId=?", [req.body.params.newpwsd, req.session.UserID], (err, result) => {
            if (err)
                res.status(400).send("Internal Server Error");
            if (result.changedRows > 0) {
                res.status(200).send('Updated');
            }
        });
    } else {
        res.status(401).send("Access Denied");
    }
});
api_router.post('/updateUserStatus', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Admin") {
        console.log(req.body.params)
        db.query("update userlogin set Status=? WHERE empId=?", [req.body.params.status, req.body.params.id], (err, result) => {

            if (err) {
                console.log("ok1")
                console.log(err)
                res.status(400).send(err);
            } else {
                console.log(result)
                if (result.changedRows > 0) {
                    console.log("ok3")
                    db.query("SELECT * FROM userlogin", (error, Data) => {
                        if (error) {
                            console.log(error)
                            res.status(400).send(error);
                        } else {
                            console.log("ok4")
                            res.status(200).send(Data);
                        }
                    });
                }
            }
        })

    } else {
        res.status(401).send("Access Denied");
    }
});
api_router.get("*", (req, res) => {
    res.status(404).send("Invalid API Request")
});

function formatDateString(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = date.toLocaleString('en-US', options);
    return formattedDate;
}
module.exports = api_router