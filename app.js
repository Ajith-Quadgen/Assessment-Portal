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
const https = require('https')
const router = express.Router();
const PDFGenerator = require('pdfkit');
const DateTime = require('node-datetime/src/datetime');
const { restart } = require('nodemon');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const { createCanvas, loadImage, registerFont } = require('canvas');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}`));
app.use(express.static('public'))
app.use('/public',express.static('public'))
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
const { isMap } = require('util/types');
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
  } else {
    res.status(400).send("Access Denied")
  }
});


// db.connect((error) => {
//   if (error) {
//     console.error('Failed to connect to MySQL database:', error);
//   } else {
//     console.log('Connected to MySQL database!');
//   }
// });

// db.end()
const port = 4500;
const host = "172.17.1.22"
const privateKey = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('cert.pem')
const credentials = { key: privateKey, cert: certificate, requestCertificate: false, rejectUnauthorized: false };
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log('server is Running under Https with port:' + port)
})



let dt = dateTime.create();
let CurrentDate = dt.format('Y-m-d H:M:S');

app.get('/', async (req, res) => {

  try {
   let Certificate_Name = `Certificate.pdf`
   let certificatePath = `./public/Generated/Certificates/${Certificate_Name}`;
    const canvas = createCanvas(1280, 720,'pdf'); // Adjust the canvas size as needed
    const ctx = canvas.getContext('2d');
    const result=[
      {
        employeeName:"Ajith Kumar",
        AssessmentName:"Node JS "

      }
    ]
    // Load background image
    loadImage('Template-11.png').then((image) => {
      //ctx.addPage()
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
      // // Load custom font (if needed)
     // registerFont('./static/Font/fruitella-rgzgk.ttf', { family: 'fruitella-rgzgk' });
        // Customize text properties
        ctx.font = '30px serif'; // Use your own font and size
        ctx.fillStyle = 'black'; // Text color
    
        // Calculate X-coordinate for horizontal alignment
        let Course="Awarded to";
        let CourseWidth = ctx.measureText(Course).width;
        let Course_xPosition = (canvas.width - CourseWidth) / 2;
        // Draw the text on the certificate
        ctx.fillText(Course, Course_xPosition, 270);
  
        ctx.font = '60px serif';
        ctx.fillStyle = '#6fbee1'; 
        const Name = `${result[0].employeeName}`;
        const NameWidth = ctx.measureText(Name).width;
        const Name_xPosition = (canvas.width - NameWidth) / 2;
        // Draw the text on the certificate
        ctx.fillText(Name, Name_xPosition, 350);
  
  
        ctx.font = '30px serif';
        ctx.fillStyle = 'black';
        Course = `On`;
         CourseWidth = ctx.measureText(Course).width;
         Course_xPosition = (canvas.width - CourseWidth) / 2;
        // Draw the text on the certificate
        ctx.fillText(Course, Course_xPosition, 420);
  
        ctx.font = '44px serif';
        Course = `${result[0]['AssessmentName']}`;
        CourseWidth = ctx.measureText(Course).width;
        Course_xPosition = (canvas.width - CourseWidth) / 2;
       // Draw the text on the certificate
       ctx.fillText(Course, Course_xPosition, 490);
  
  
        ctx.font = '30px sans';
     
        let Current_Date=new Date().toLocaleDateString('en-US').replaceAll('/','-');
        Current_Date=`Dated: ${Current_Date}`
        const DateWidth = ctx.measureText(Current_Date).width;
        const Date_xPosition = (canvas.width - DateWidth) / 2;
        // Draw the text on the certificate
        ctx.fillText(Current_Date, Date_xPosition, 560);
    
        // Save the certificate as an image (e.g., PNG)
        const stream = canvas.createPDFStream();
       // const stream = canvas.createPNGStream();
        const outputFile = fs.createWriteStream(certificatePath);
        stream.pipe(outputFile);
    });
  } catch (err) {
    console.error('Certificate generation and saving failed:', err);
  }

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
  db.query("select * from userlogin where empId=? or email=? and password=? and status='Active'", [UserInfo.Username, UserInfo.Username, UserInfo.password], function (error, result) {
    if (error) throw error;
    if (result.length > 0) {
      db.query("update userlogin set lastSeen=? where empId=?", [CurrentDate, result[0].empId], function (error, result) {
        if (error) throw error;
      });
      req.session.UserID = result[0].empId;
      req.session.UserRole = result[0].role;
      req.session.UserName = result[0].employeeName;
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
      res.redirect('/?Message=Invalid UserName or Password');
    }
  })
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
  } else {
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
        res.render('Employees/takeAssessment', { jsonData: jsonData, "result": result[0], message: null, user: req.session.UserRole,title:"Assessment Page" });
      } else {
        const queryData = queryString.stringify({
          message: Buffer.from("Invalid Assessment Key").toString('base64')
        });
        res.redirect('/Employee?' + queryData);
      }
    });
  } else {
    res.status(400).send("Access Denied");
  }
})




app.post('/submit-assessment', async (req, res) => {
  if (req.session.UserID) {
    const answerScript = JSON.parse(req.body.JsonFormData);
    db.query("Select * from assessments,userlogin where userlogin.empId=?  and AssessmentID=? and AssesmentKey=?", [req.session.UserID, req.body.AssessmentID, req.body.AssessmentKey], function (error, result) {
      db.query("select * from userlogin where empid=?", [result[0].CreatedBy], async (err, result2) => {
        if (err) throw err;
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
              if (questionName !== 'MaxScore' && questionName != "SectionName") {
                const question = section[questionName];
                const answer = answers[questionName];
                if (answer && answer.correctOption === question.answer) {
                  sectionScore += parseInt(question.point);
                }
              }
            }
            Result[sectionName] = sectionScore;
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
        const filename = `${req.session.UserID}_${Date.now()}_${result[0]['AssessmentName']}_Report.pdf`
        const path = `./public/Generated/AssessmentReport/${filename}`;
        const question = Questionnaire;
        const result1 = Result;
        const maxScore = maxMarks;
        //header
        let theOutput = new PDFGenerator({ bufferPages: true, font: 'Courier' })
        theOutput.pipe(fs.createWriteStream(path));
        theOutput.fontSize(16).fillColor('black').font('Helvetica-Bold').text('Assessment Response', 50, 30, { align: 'center', underline: true, lineGap: 5 })
        theOutput.image('./static/images/Quadgen_Logo.png', 20, 10, { width: 45, height: 50 }).fillColor('#000').fontSize(20)
        //Content
        theOutput.moveDown()
        theOutput.fontSize(14).font('Helvetica').fillColor('black').text(`Title:${question.Title}`)
        theOutput.moveDown()
        theOutput.fontSize(12).fillColor('black').text(`Employee ID: ${result[0].empId}`)
        theOutput.fontSize(12).fillColor('black').text(`Name: ${result[0].employeeName}`)
        theOutput.fontSize(12).fillColor('black').text(`Trainer: ${result2[0].employeeName}`)
        theOutput.fontSize(12).fillColor('black').text(`Total Score: ${question.TotalScore}`)
        theOutput.fillColor('black').text(`Date: ${dt.format('d-m-Y H:M:S')}`)
        theOutput.moveDown()
        theOutput.fontSize(11).fillColor('black').text("Description:", { underline: true }).text(`${question.Description}`, { align: 'justify' })
        theOutput.moveDown(2)
        for (const sectionName in question) {
          if (sectionName.startsWith('Section')) {
            const section = question[sectionName];
            const answers = answerScript[sectionName];
            let sectionScore = 0;
            theOutput.fontSize(14).fillColor('black').text(`${sectionName} : ${section.SectionName}`).fontSize(12).text(`Max Score: ${section.MaxScore}`, { align: 'right' })
            theOutput.moveDown()
            for (const questionName in section) {
              if (questionName !== 'MaxScore' && questionName !== 'SectionName') {
                const question = section[questionName];
                const answer = answers[questionName];
                theOutput.fontSize(14).fillColor('black').font('Helvetica-Bold').text(`${questionName}: ${question.question}`)
                theOutput.fillColor('black').font('Helvetica').text(`Point:${question.point}`, { align: 'right' })

                if (question['referenceImage']) {
                  theOutput.moveDown()
                  theOutput.image(`./public/uploads/Trainer/${question['referenceImage']}`, { fit: [400, 150], align: 'left' })
                }
                for (const key in question.options) {
                  if (answer && question.answer == question['options'][key] && question.answer == answer.correctOption) {
                    theOutput.fillColor('green').text(`${key + ': ' + question['options'][key]}`)
                  } else if (answer && answer.correctOption == question['options'][key]) {
                    theOutput.fillColor('red').text(`${key + ': ' + question['options'][key]}`)
                  } else {
                    theOutput.fillColor('black').text(`${key + ': ' + question['options'][key]}`)
                  }
                }
                theOutput.fontSize(12).fillColor('blue').text(`Answer: ${question.answer}`);
                theOutput.moveDown()
              }
            }
          }
        }
        theOutput.fillColor("black").fontSize(18).text("Result:").moveDown()
        for (const records in result1) {
          if (records.startsWith('Section')) {
            theOutput.fontSize(14).text(`${records}: ${result1[records]}`)
          }
        }
        theOutput.fontSize(14).text(`Total Score: ${result1.TotalScore}/${maxScore}`)
        theOutput.fontSize(14).text(`Percentage: ${result1.SecuredPercentage}%.`)
        theOutput.text(`Remarks: ${req.body.AssessmentRemarks}`)
        if (result1.Result == "Cleared") {
          theOutput.fillColor('green').fontSize(14).text(`Result: CLEARED`)
        } else if (result1.Result == "Not Cleared") {
          theOutput.fillColor('red').fontSize(14).text(`Result: NOT CLEARED`)
        }
        //footer
        const pages = theOutput.bufferedPageRange(); // => { start: 0, count: 2 }
        for (let i = 0; i < pages.count; i++) {
          theOutput.switchToPage(i);
          //Footer: Add page number
          let oldBottomMargin = theOutput.page.margins.bottom;
          theOutput.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
          theOutput.fillColor('black').fontSize(10).text(`Page: ${i + 1} of ${pages.count}`, 0.5 * (theOutput.page.width - 100), theOutput.page.height - 50, {
            width: 100,
            align: 'center',
            lineBreak: false,
          });
          theOutput.page.margins.bottom = oldBottomMargin;
        }
        theOutput.end()
        let { certificatePath, Certificate_Name } = "";
        if (resultLabel == "Cleared") {
          try {
            Certificate_Name = `${req.session.UserID}_${Date.now()}_${result[0]['AssessmentName']}_Certificate.pdf`
            certificatePath = `./public/Generated/Certificates/${Certificate_Name}`;
            const canvas = createCanvas(1280, 720,'pdf'); // Adjust the canvas size as needed
            const ctx = canvas.getContext('2d');
            
            // Load background image
            loadImage('Template-11.png').then((image) => {
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            
              // // Load custom font (if needed)
             // registerFont('./static/Font/fruitella-rgzgk.ttf', { family: 'fruitella-rgzgk' });
                // Customize text properties
                ctx.font = '30px serif'; // Use your own font and size
                ctx.fillStyle = 'black'; // Text color
            
                // Calculate X-coordinate for horizontal alignment
                let Course="Awarded to";
                let CourseWidth = ctx.measureText(Course).width;
                let Course_xPosition = (canvas.width - CourseWidth) / 2;
                // Draw the text on the certificate
                ctx.fillText(Course, Course_xPosition, 270);
          
                ctx.font = '60px serif';
                ctx.fillStyle = '#6fbee1'; 
                const Name = `${result[0].employeeName}`;
                const NameWidth = ctx.measureText(Name).width;
                const Name_xPosition = (canvas.width - NameWidth) / 2;
                // Draw the text on the certificate
                ctx.fillText(Name, Name_xPosition, 350);
          
          
                ctx.font = '30px serif';
                ctx.fillStyle = 'black';
                Course = `On`;
                 CourseWidth = ctx.measureText(Course).width;
                 Course_xPosition = (canvas.width - CourseWidth) / 2;
                // Draw the text on the certificate
                ctx.fillText(Course, Course_xPosition, 420);
          
                ctx.font = '44px serif';
                Course = `${result[0]['AssessmentName']}`;
                CourseWidth = ctx.measureText(Course).width;
                Course_xPosition = (canvas.width - CourseWidth) / 2;
               // Draw the text on the certificate
               ctx.fillText(Course, Course_xPosition, 490);
          
          
                ctx.font = '30px sans';
             
                let Current_Date=new Date().toLocaleDateString('en-US').replaceAll('/','-');
                Current_Date=`Dated: ${Current_Date}`
                const DateWidth = ctx.measureText(Current_Date).width;
                const Date_xPosition = (canvas.width - DateWidth) / 2;
                // Draw the text on the certificate
                ctx.fillText(Current_Date, Date_xPosition, 560);
            
                // Save the certificate as an image (e.g., PNG)
                const stream = canvas.createPDFStream();
                const outputFile = fs.createWriteStream(certificatePath);
                stream.pipe(outputFile);
            });
          } catch (err) {
            console.error('Certificate generation and saving failed:', err);
          }
        }

        const inputData = {
          AssessmentID: req.body.AssessmentID,
          answerscript: JSON.stringify(answerScript),
          obtainedmarks: JSON.stringify(Result),
          employeeid: req.session.UserID,
          date: CurrentDate,
          remarks: req.body.AssessmentRemarks,
          Result: resultLabel,
          report: filename,
          certificate: Certificate_Name
        };
        db.query('INSERT INTO responces  set?', [inputData], function (error1, result1) {
          if (error1) {
            console.log(error1)
          }
          db.query("Update repeatrequest set status=IF(status='Approved','Appeared',status) where (userID=? and assessmentkey=?)", [req.session.UserID, req.body.AssessmentKey], (error2, result2) => {
            if (error2) {
              console.log(error2)
            } else {
              res.render('Employees/Result', { Result: Result,Role:req.session.UserRole,title:"Assessment Result" });
            }
          });
        });
      });
    });
  } else {
    res.redirect('/login');
  }
});


app.get('/Error', (req, res) => {
  res.render('error');
});
app.get('/changePassword', async (req, res) => {
  if (req.session.UserID) {
    res.render('ChangePassword',{Role:req.session.UserRole,title:"Change Password"})
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('*', async (req, res) => {
  res.redirect('/login');
  //res.status(400).send("Page Not Found");
});




function formatDateString(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}
function formatDateToOrdinal(date) {
  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let daySuffix = "th";
  if (day === 1 || day === 21 || day === 31) {
    daySuffix = "st";
  } else if (day === 2 || day === 22) {
    daySuffix = "nd";
  } else if (day === 3 || day === 23) {
    daySuffix = "rd";
  }

  return `${day}${daySuffix} ${month} ${year}`;
}