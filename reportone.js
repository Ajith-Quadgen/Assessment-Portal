const db = require('./DataBaseConnection')
const fs = require('fs');
const PDFGenerator = require('pdfkit')
db.query('SELECT R.answerscript,R.obtainedmarks,R.AssessmentID,A.Questionnaire,A.AssessmentName,A.AssesmentKey,A.MaximumScore FROM responces R,assessments A where R.AssessmentID=A.AssessmentID and R.idresponces="1"', async (err, result) => {
    const answerScript = JSON.parse(result[0]['answerscript']);
    const Questionnaire = JSON.parse(result[0]['Questionnaire']);
    const AssessmentResult = JSON.parse(result[0]['obtainedmarks']);
    await generate(Questionnaire, answerScript, AssessmentResult, result[0]['MaximumScore']);
});

async function generate(question, answerScript, result, maxScore) {
    let theOutput = new PDFGenerator
    theOutput.pipe(fs.createWriteStream('QuestionPaper.pdf'));
    //header
    theOutput.fontSize(16).fillColor('black').text('Assessment Report', 50, 30, { bold: false, align: 'center', underline: true })
    theOutput.image('./static/images/Quadgen_Logo.png', 20, 10, { width: 55, height: 50 }).fillColor('#000').fontSize(20)
    //Content
    theOutput.moveDown()
    theOutput.fontSize(14).fillColor('black').text(`Title:${question.Title}`)
    theOutput.fontSize(12).fillColor('black').text(`Total Score: ${question.TotalScore}`, { align: 'right' })
    theOutput.fontSize(11).fillColor('black').text(`Description: ${question.Description}`)
    theOutput.moveDown(2)
    theOutput.moveTo(50, 200).lineTo(550, 200).stroke()
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
                    theOutput.fillColor('black').text(`${questionName}: ${question.question}`)
                    theOutput.fillColor('black').text(`Point:${question.point}`, { align: 'right' })

                    if (question['referenceImage']) {
                        theOutput.moveDown()
                        theOutput.image(`./public/uploads/Trainer/${question['referenceImage']}`, { fit: [400, 150], align: 'left' })
                    }
                    for (const key in question.options) {
                        if (question.answer == question['options'][key]) {
                            theOutput.fillColor('green').text(`${key + ': ' + question['options'][key]}`)
                        } else if (answer.correctOption == question['options'][key]) {
                            theOutput.fillColor('red').text(`${key + ': ' + question['options'][key]}`)
                        } else {
                            theOutput.fillColor('black').text(`${key + ': ' + question['options'][key]}`)
                        }
                    }
                    theOutput.moveDown()
                    // if (answer && answer.correctOption === question.answer) {
                    //     sectionScore += parseInt(question.point);
                    // } 
                }
            }
        }
    }
    theOutput.moveTo(50, 200).lineTo(550, 200).stroke()

    theOutput.fillColor("black").fontSize(18).text("Result:").moveDown()
    for (const records in result) {
        if (records.startsWith('Section')) {
            theOutput.fontSize(14).text(`${records}: ${result[records]}`)
        }
    }
        theOutput.fontSize(14).text(`Total Score: ${result.TotalScore}/${maxScore}`)
        theOutput.fontSize(14).text(`Percentage: ${result.SecuredPercentage}%.`)
        if (result.Result == "Cleared") {
            theOutput.fillColor('Green').fontSize(14).text(`Result: CLEARED`)
        } else if (result.Result == "Not Cleared") {
            theOutput.fillColor('red').fontSize(14).text(`Result: NOT CLEARED`)
        }
    theOutput.moveTo(50, 200).lineTo(550, 200).stroke()
    //footer
    theOutput.end()
}