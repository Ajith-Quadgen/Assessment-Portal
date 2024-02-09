const express = require('express');
const api_router = express.Router()
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const db = require('../DataBaseConnection')
const crypto = require('crypto');
const PDFGenerator = require('pdfkit');
const DateTime = require('node-datetime/src/datetime');
const excel = require('exceljs');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { error, log } = require('console');

const transporter = nodemailer.createTransport(
    smtpTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'software.development@quadgenwireless.com ', // Your Gmail email address
            pass: 'mrzpgphmoulavifx '   // Your Gmail password or app-specific password
        }

    })
);
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
function getTimeStamp() {
    return (new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));
}
const upload = multer({ storage: myStorage, limits: { fileSize: 500000 } }).single("myQCImage");

api_router.post('/GeneratePasswordResetOPT', async (req, res) => {
    let n = 0;
    n = crypto.randomInt(100000, 999999)
    db.query("Select * from userlogin where Status='Active' and empId=?", [req.body.params.UserID], async (error, result) => {
        if (error) {
            console.log(error)
            return res.status(406).json({ Message: "Unable to find your Details, Try after sometime...!" })
        } else {
            if (result.length > 0) {
                const mailOptions = {
                    from: 'software.development@quadgenwireless.com ',
                    to: result[0].email,
                    subject: `OTP For Password Generation is_${n}`,
                    html: `<h3>Hi ${result[0].employeeName}</h3><br>The One Time Password for Generating new Login Credentials for Assessment Portal is<b><h2>${n}</h2></b><br>This is OTP will Expire in 5 Min.<br><br><br>Regards`,
                };
                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error on sending email:', error);
                        req.session.PWDResetOTP = null;
                        res.status(406).json({ Message: "Failed to Generate OTP, Try again...!" })
                    } else {
                        req.session.PWDResetOTP = n;
                        req.session.PWDresetEmail = result[0].email;
                        req.session.PWDResetUserID = req.body.params.UserID;
                        res.status(200).json({ Message: "The OTP is sent to your mail" })
                    }
                });
            } else {
                return res.status(406).json({ Message: "Unable to find your Details, Try after sometime...!" })
            }
        }
    })

})

api_router.post("/GenerateNewPassword", (req, res) => {
    const UserOTP = req.body.params.OTP;
    if (req.session.PWDResetOTP == UserOTP) {
        const RandomPWD = Math.random().toString(36).substring(2, 12);
        db.query("update userlogin set password=? where empId=? and email=? and Status='Active'", [RandomPWD, req.session.PWDResetUserID, req.session.PWDresetEmail], (error, result) => {
            if (error) {
                console.log(error)
                return res.status(406).json({ Message: "Something Went wrong, Unable to Generate New Password." })
            } else {
                const mailOptions = {
                    from: 'software.development@quadgenwireless.com ',
                    to: req.session.PWDresetEmail,
                    subject: `New Password for QG-Assessment Portal`,
                    html: `<h3>Hi</h3>
                    The New Login Credentials for QG-Assessment Portal:<br>
                    <p><b>UserID:</b> ${req.session.PWDResetUserID}</p>
                    <p><b>Password:</b> ${RandomPWD}<br></p></br>
                    <b>Note:</b> After Login Please Change Your Password.
                    <br><br>--<br>Regards`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error on sending email:', error);
                        req.session.PWDResetOTP = null;
                        req.session.PWDResetUserID = null;
                        req.session.PWDresetEmail = null;
                        return res.status(406).json({ Message: "Something Went wrong, Unable to Generate New Password." })
                    } else {
                        req.session.PWDResetOTP = null;
                        req.session.PWDResetUserID = null;
                        req.session.PWDresetEmail = null;
                        return res.status(200).json({ Message: "OTP Verification Successful\nNew Password has been shared to you vai Email." })
                    }
                });
            }
        })

    } else {
        return res.status(406).json({ Message: "Invalid OTP,Try again...!" })
    }
})

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
api_router.get('/AssessmentDetailssssss', (req, res) => {
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
                                res.status(400).send("You have already appeared for this assessment/Your Reappearing request is not yet approved by your trainer.\nTry again later...!");
                            }
                            //res.status(400).send("You have already submitted an Reappear request. You cant raise new request.")

                        })
                    } else {
                        db.query("select * from responces R,assessments A where R.employeeid=? and R.AssessmentID=A.AssessmentID and A.AssesmentKey=? and R.Result='Cleared'", [req.session.UserID, req.query.AssesmentKey], (error4, result4) => {
                            if (error4) throw error4
                            if (result4.length > 0) {
                                res.status(400).send("You have already cleared this Assessment, So your Not Allowed to Appear for this Assessment One Again.")
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
api_router.get('/AssessmentDetails', (req, res) => {
    if (req.session.UserID) {
        db.query("select * from assessments where AssesmentKey=? and Status='Published'", [req.query.AssesmentKey], function (error, result) {
            if (error) throw error
            if (result.length > 0) {
                db.query("SELECT * FROM assessment_session where User_ID=? and Assessment_ID=? and Status='Ongoing'", [req.session.UserID, req.query.AssesmentKey], (error, resultx) => {
                    if (error) {
                        console.log(error);
                    } else if (resultx.length > 0) {
                        return res.status(400).send(`You have already started this assessment at ${resultx[0].Start_Time}.\nYou can't start the assessment again.\nReach out to your trainer to Take up the assessment.`)
                    } else {
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
                                        res.status(400).send("You have already appeared for this assessment/Your Reappearing request is not yet approved by your trainer.\nTry again later...!");
                                    }
                                    //res.status(400).send("You have already submitted an Reappear request. You cant raise new request.")

                                })
                            } else {
                                db.query("select * from responces R,assessments A where R.employeeid=? and R.AssessmentID=A.AssessmentID and A.AssesmentKey=? and R.Result='Cleared'", [req.session.UserID, req.query.AssesmentKey], (error4, result4) => {
                                    if (error4) throw error4
                                    if (result4.length > 0) {
                                        res.status(400).send("It seems you have cleared the assessment. Hence you are not eligible for a retake.")
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
                            }
                        })
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
        db.query("select * from responces R,assessments A where R.employeeid=? and A.AssessmentID=R.AssessmentID and A.AssesmentKey=? and R.Result='Not Cleared'", [req.session.UserID, req.query.key], (error, result0) => {
            if (error) throw error

            if (result0.length > 0) {
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
                req.session.destroy();
                res.status(200).send('Updated');                
            }
        });
    } else {
        res.status(401).send("Access Denied");
    }
});
api_router.post('/updateUserStatus', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Admin") {
        db.query("update userlogin set Status=? WHERE empId=?", [req.body.params.status, req.body.params.id], (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send(err);
            } else {
                if (result.changedRows > 0) {
                    db.query("Select *,date_format(lastSeen,'%d-%b-%y/%r') as newLastSeen from userlogin where role!='Admin'  order by employeeName", (error, Data) => {
                        if (error) {
                            console.log(error)
                            res.status(400).send(error);
                        } else {
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

api_router.get('/DownloadAssessmentReport', (req, res) => {
    if (req.session.UserID && req.session.UserRole != "Employee") {
        let ConsolidatedResponces = [];
        let result = {};
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("Assessment Report");
        try {
            db.query("SELECT R.*,U.* FROM responces R,userlogin U where R.employeeid=U.empId and R.AssessmentID=?;", [req.query.AssessID], async function (error, resultOne) {
                if (error) throw error;

                if (resultOne.length > 0) {
                    var MyColumns = [
                        { header: "Submitted Date", key: "date", width: 10 },
                        { header: "Participant Name", key: "employeeName", width: 20 }
                    ]
                    let temp = JSON.parse(resultOne[0].obtainedmarks);

                    for (const attribute in temp) {
                        if (attribute.startsWith("Section")) {
                            MyColumns.push({ header: attribute, key: attribute, width: 10 })

                        }
                    }
                    MyColumns.push(
                        { header: "Secured Marks", key: "TotalScore", width: 5 },
                        { header: "Percentage", key: "SecuredPercentage", width: 5 },
                        { header: "Result", key: "Result", width: 10 },
                        { header: "Remarks", key: "remarks", width: 20 }
                    )
                    worksheet.columns = MyColumns;
                    resultOne.forEach(row => {
                        let temp = JSON.parse(row.obtainedmarks);
                        row.TotalScore = temp.TotalScore;
                        row.SecuredPercentage = temp.SecuredPercentage;
                        for (const attribute in temp) {
                            if (attribute.startsWith("Section")) {
                                row[attribute] = temp[attribute]
                            }
                        }
                        //console.log(temp.TotalScore)
                        worksheet.addRow(row)
                    })
                    // Set response headers for Excel file download
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');

                    // Save the Excel file to the response
                    //await workbook.xlsx.write(res);
                    await workbook.xlsx.writeFile("./public/Generated/report.xlsx").then(() => {
                        res.download('./public/Generated/report.xlsx')

                    });
                    // await workbook.xlsx.write(res).then(() => {
                    //     //res.download('./public/Generated/report.xlsx')

                    // });
                } else {
                    console.log("no data")
                }
            });
        } catch (error) {
            res.status(401).send(`Internal Server Error:${error}`)
        }

    } else {
        res.status(400).send("Access Denied");
    }

})

api_router.get('/GetUser', (req, res) => {
    if (req.session.UserID) {
        db.query('Select *,date_format(lastSeen,"%d-%b-%y/%r") as newLastSeen from userlogin where role!="Admin" and (empId like "%' + req.query.key + '%" or employeeName like "%' + req.query.key + '%")', (error, result) => {
            if (error) {
                console.log(error)
                res.status(400).send("Internal Server Error")
            } else if (result.length > 0) {
                res.status(200).send(result)
            } else {
                res.status(400).send("Data Not Found")
            }
        })
    } else {
        res.status(400).send("Access Denied")
    }
})
api_router.post('/updateUserInfo', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Admin") {
        db.query("update userlogin set employeeName=?,email=?,role=? WHERE empId=?", [req.body.params.employeeName, req.body.params.email, req.body.params.role, req.body.params.id], (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send(err);
            } else {
                if (result.changedRows > 0) {
                    db.query("Select *,date_format(lastSeen,'%d-%b-%y/%r') as newLastSeen from userlogin where role!='Admin'  order by employeeName", (error, Data) => {
                        if (error) {
                            console.log(error)
                            res.status(400).send(error);
                        } else {
                            res.status(200).send(Data);
                        }
                    });
                }
            }
        })
    } else {
        res.status(400).send("Access Denied")
    }
})
api_router.post('/AssessmentStarted', (req, res) => {
    if (req.session.UserID) {
        var x = new Date(getTimeStamp()).getTime()
        var y = new Date(x + parseInt(req.body.params.Duration) * 60 * 1000).toISOString().slice(0, 10) + " " + new Date(x + parseInt(req.body.params.Duration) * 60 * 1000).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' })
        db.query("insert into assessment_session (`User_ID`,`Assessment_ID`,`Start_Time`,`End_Time`) values (?,?,?,?)", [req.session.UserID, req.body.params.Ass_Id, getTimeStamp(), y], (error, result) => {
            if (error) {
                console.log(error)
            } else {
                log("ok")
            }
        })
    }
})
api_router.post('/deleteSession', (req, res) => {
    if (req.session.UserID && req.session.UserRole == "Trainer") {
        db.query("delete from assessment_session where idAssessment_Session=?",[req.body.params.ID],(error,result)=>{
            if(error){
                console.log(error)
            }else{
                return res.status(200).send("ok")
            }
        })
    } else {
        res.status(400).send("Access Denied")
    }
})
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