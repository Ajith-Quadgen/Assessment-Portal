const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database_name'
});

app.post('/submit-questionnaire', (req, res) => {
  const questionnaire = [];
  const { body } = req;
  const keys = Object.keys(body);

  keys.forEach((key) => {
    if (key.includes('question')) {
      const question = body[key];
      const options = [];
      const optionKeys = Object.keys(body).filter((k) => k.includes(key) && k !== key);

      optionKeys.forEach((optionKey) => {
        options.push(body[optionKey]);
      });

      const selectedAnswer = body[key];

      questionnaire.push({
        question,
        options,
        selectedAnswer
      });
    }
  });

  const query = `INSERT INTO questionnaires (questionnaire) VALUES ('${JSON.stringify(questionnaire)}')`;

  connection.query(query, (error, results, fields) => {
    if (error) throw error;
    res.send('Questionnaire submitted successfully!');
  });
});
const x = { "Title": "jytviuyy", 
"Cutoff": "70", 
"Duration": "8", 
"Section1": { "MaxScore": 2, 
"Question1": { "type": "Boolean", "point": "2", "answer": "True", 
"options": { "Option1": "True", "Option2": "False" }, 
"question": "hvuyitiuy", "correctOption": "True", "referenceImage": "INTER13_7789234.jpg_1691081690907.jpg" }, "SectionName": "kuyobu87iu" }, 
"Section2": { "MaxScore": 11, "Question1": { "type": "Boolean", "point": "8", "answer": "True", "options": { "Option1": "True", "Option2": "False" }, "question": "kuboiu", "correctOption": "True" }, 
 "Question2": { "type": "MCQ", "point": "3", "answer": "kjghuy", "options": { "Option1": "kjghuy", "Option2": "bgttuyu", "Option3": "yibuj", "Option4": "ukytiy" }, "question": "kgbu kyi  tu", "correctOption": "1" }, "SectionName": "kiyubuyo" }, "TotalScore": 13, "Description": "" }