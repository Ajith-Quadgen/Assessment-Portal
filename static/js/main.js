//const { json } = require("body-parser");

//const { name } = require("ejs");

var activeSection = 1;

$(document).ready(function () {
  const currentDate = new Date().toISOString().split('T')[0];
  if (document.getElementById('AssessmentDate')) {
    document.getElementById("AssessmentDate").setAttribute("min", currentDate);
  }

  var sectionCounter = 2;
  sectionCounter = document.getElementsByClassName("mySection").length;

  let questionCounter = 1;
  $('#Add_MCQ_Button').click(function () {
    const questionHtml = `
      <div class="question" data-question="${questionCounter}">
      <div class="row justify-content-end">
      <button type="button" class="btn  btn-close me-2 removeQuestionBtn" data-question="${questionCounter}" aria-label="Close"></button>
    </div>
        <h3>Question${questionCounter}</h3>
        <div>
        <!--<label class="form-label" for="question${questionCounter}">Question:${questionCounter}</label>-->
          <textarea class="form-control" name="section[${activeSection}]question[${questionCounter}][question]" id="question${questionCounter}" cols="90" rows="1" wrap="soft" spellcheck="true" placeholder="Enter the Question..!" required></textarea>
        </div>
        <div class="options">
        <div class="d-flex justify-content-between align-items-end m-2 p-1">
        <div data-bs-toggle="tooltip" data-bs-title="Attach an Image (Max Size 500kb)">
        <input class="form-control" type="file" accept="image/*" id="imageInput${questionCounter}" name="myQCImage" onchange="uploadImage(this,'section[${activeSection}]question[${questionCounter}][referenceImage]','section[${activeSection}]question[${questionCounter}][uploadedImage]');">
         <input type="hidden" name="section[${activeSection}]question[${questionCounter}][referenceImage]" id="section[${activeSection}]question[${questionCounter}][referenceImage]" readonly>
        </div>
        <div data-bs-toggle="tooltip" data-bs-title="Click to View the Attachment">
        <img id="section[${activeSection}]question[${questionCounter}][uploadedImage]"  class="img-thumbnail" height="100" width="100" onclick="ExpandImage(this)" src="" alt="Uploaded Image" style="display:none" data-bs-toggle="modal" data-bs-target="#Image_Model"/>
        </div>
        <div class=" input-group" style="width: max-content;">
        <span class="input-group-text" for="score${questionCounter}">Points</span>
        <input type="number" class="form-control" id="score${questionCounter}" name="section[${activeSection}]question[${questionCounter}][score]" min="1" max="50" value="1" onchange="UpdateTotalPoints()" required>
        </div>
        </div>
        
            <div class="input-group mb-2">
            <div class="input-group-text">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="1" onclick="setAnswer(this,'mcq')" data-bs-toggle="tooltip" data-bs-title="Fill all the options before selecting the correct answer" required>
              </div>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option1]" id="option1_${questionCounter}" placeholder="Option-1" required>
          </div>
          <div class="input-group mb-2">
          <div class="input-group-text">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="2" onclick="setAnswer(this,'mcq')" data-bs-toggle="tooltip" data-bs-title="Fill all the options before selecting the correct answer" required>
          </div>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option2]" id="option2_${questionCounter}" placeholder="Option-2" required>
          </div>
          <div class="input-group mb-2">
          <div class="input-group-text">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="3" onclick="setAnswer(this,'mcq')" data-bs-toggle="tooltip" data-bs-title="Fill all the options before selecting the correct answer" required>
              </div>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option3]" id="option3_${questionCounter}" placeholder="Option-3" required>
          </div>
          <div class="input-group mb-2">
          <div class="input-group-text">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="4" onclick="<%-i%>(this,'mcq')" data-bs-toggle="tooltip" data-bs-title="Fill all the options before selecting the correct answer" required>
            </div>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option4]" id="option4_${questionCounter}" placeholder="Option-4" required>
          </div>
        </div>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][answer]" id="answer${questionCounter}" requited readonly>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][questionType]" id="questionType${questionCounter}" value="MCQ" readonly>
      </div>`;
    $('#questionsContainer' + activeSection).append(questionHtml);
    questionCounter++;
    updateQuestionNumbers();
  });


  $('#Add_Boolean_Button').click(function () {
    const questionHtml = `
      <div class="question" data-question="${questionCounter}">
      <div class="row justify-content-end">
      <button type="button" class="btn me-2 btn-close removeQuestionBtn" data-question="${questionCounter}" aria-label="Close"></button>
    </div>
        <h3>Question${questionCounter}</h3>
        <div>
        <!--<label class="form-label" for="question${questionCounter}">Question:${questionCounter}</label>-->
          <textarea class="form-control" name="section[${activeSection}]question[${questionCounter}][question]" id="question${questionCounter}" cols="90" rows="1" wrap="soft" spellcheck="true" placeholder="Enter the Question..!" required></textarea>
        </div>
        <div class="options">
        <div class="d-flex justify-content-between align-items-center m-2 p-1">
        <div data-bs-toggle="tooltip" data-bs-title="Attach an Image (Max Size 500kb)">
        <input class="form-control" type="file" accept="image/*" id="imageInput${questionCounter}" name="myQCImage" onchange="uploadImage(this,'section[${activeSection}]question[${questionCounter}][referenceImage]','section[${activeSection}]question[${questionCounter}][uploadedImage]');">
         <input type="hidden" name="section[${activeSection}]question[${questionCounter}][referenceImage]" id="section[${activeSection}]question[${questionCounter}][referenceImage]" readonly>
        </div>
        <div data-bs-toggle="tooltip" data-bs-title="Click to View the Attachment">
        <img id="section[${activeSection}]question[${questionCounter}][uploadedImage]"  class="img-thumbnail" height="100" width="100" onclick="ExpandImage(this)" src="" alt="Uploaded Image" style="display:none" data-bs-toggle="modal" data-bs-target="#Image_Model"/>
        </div>
        <div class=" input-group" style="width: max-content;">
        <span class="input-group-text" for="score${questionCounter}">Points</span>
        <input type="number" class="form-control" id="score${questionCounter}" name="section[${activeSection}]question[${questionCounter}][score]" min="1" max="50" value="1" onchange="UpdateTotalPoints()" required>
        </div>

        </div>
          <div>
            <label  class="form-label" for="option1_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="True" onclick="setAnswer(this,'boolean')"  data-bs-toggle="tooltip" data-bs-title="Select the Correct Answer" required>
              Option 1: True
            </label>
          </div>
          <div>
            <label class="form-label" for="option2_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="False" onclick="setAnswer(this,'boolean')"  data-bs-toggle="tooltip" data-bs-title="Select the Correct Answer" required>
              Option 2: False
            </label>
          </div>
        </div>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][answer]" id="answer${questionCounter}" value="" requited readonly>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][questionType]" id="questionType${questionCounter}" value="Boolean" readonly>
      </div>`;
    $('#questionsContainer' + activeSection).append(questionHtml);
    questionCounter++;
    updateQuestionNumbers();
  });


  $('#Add_Section_Button').click(function () {
    sectionCounter++;
    const sectionHTML = `<div class="accordion section mySection" id="accordionSection${sectionCounter}" data-section="${sectionCounter}" onclick="updateActiveSheet(this)">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#section${sectionCounter}"
          aria-expanded="true" aria-controls="section${sectionCounter}">
          <input type="text" class="form-control bg-light-subtle border border-light-subtle rounded-pill w-25" name="SectionName${sectionCounter}" id="" placeholder="Enter the Section-${sectionCounter} Name" required>
          <p class="container px-1 mb-1 text-center">Max-Points:&nbsp;<b><span class="sectionScore" id="sectionScore${sectionCounter}">0</b></span></p>
        </button>
      </h2>
      <div id="section${sectionCounter}" class="accordion-collapse collapse show" data-bs-parent="#accordionSection${sectionCounter}">
        <div class="accordion-body" id="questionsContainer${sectionCounter}">
        </div>
      </div>
      <div class="container px-1 mb-1 text-center">
      <button type="button" class="btn btn-outline-info rounded-pill" data-bs-toggle="modal" data-bs-target="#AddNewItem">
        Add <i class="bi bi-plus-circle"></i>
      </button>
      <button type="button" class="btn mb-1 btn-outline-danger rounded-pill removeSectionBtn" data-bs-toggle="modal" data-section="${sectionCounter}">
      Delete <i class="bi bi-trash3"></i>
    </button>
      </div>
    </div>
    </div>`;
    $('#main').append(sectionHTML);
    sectionCounter++;
    activeSection = sectionCounter;
  });

  $(document).on('click', '.removeQuestionBtn', function () {
    const questionNumber = $(this).data('question');
    $(`div.question[data-question="${questionNumber}"]`).remove();
    questionCounter--;
    updateQuestionNumbers();
  });

  $(document).on('click', '.removeSectionBtn', function () {
    const sectionNumber = $(this).data('section');
    if (sectionCounter >= 2) {
      if (confirm("Are you sure you want to delete this section...?") && sectionCounter >= 2) {
        $(`div.section[data-section="${sectionNumber}"]`).remove();
        sectionCounter--;
        updateSectionNumbers();
        updateQuestionNumbers();
      };
    } else {
      alert("You Can't Delete the Last Section.\nMinimum of One Section is Required..!")
    }
  });
});




function setAnswer(option, type) {
  const mixedNumber = option.name.match(/\d+/gi).map(Number);
  console.log(mixedNumber)
  if (type == 'mcq' || type == "MCQ") {
    document.getElementById("answer" + mixedNumber[1]).value = document.getElementById("option" + option.value + "_" + mixedNumber[1]).value;
    console.log(document.getElementById("answer" + mixedNumber[1]).value)
  } else if (type == 'boolean' || type == 'Boolean') {
    document.getElementById("answer" + mixedNumber[1]).value = option.value;
    console.log(document.getElementById("answer" + mixedNumber[1]).value)

  }
}

function updateActiveSheet(e) {
  var elem_id = e.id;
  activeSection = elem_id.replace(/[^0-9]/g, '');
}

function updateQuestionNumbers() {
  $('.question').each(function (index) {
    const newQuestionNumber = index + 1;

    $(this).attr('data-question', newQuestionNumber);
    $(this).find('h3').text(`Question ${newQuestionNumber}`);

    //$(this).find('label[for^="question"]').attr('for', `question${newQuestionNumber}`);
    // $(this).find('input[name^="question"]').attr('name', `question[${newQuestionNumber}][question]`);
    //$(this).find('input[id^="question"]').attr('id', `question${newQuestionNumber}`);

    $(this).find('textarea[name^="section"]textarea[name*="question"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][question]`);

    $(this).find('textarea[name^="question"]').attr('id', `question[${newQuestionNumber}]`);

    $(this).find('input[type="number"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][score]`);
    $(this).find('input[type="file"]').attr('id', `imageInput${newQuestionNumber}`);
    $(this).find('input[type="file"]').attr('onchange', `uploadImage(this,'section[${activeSection}]question[${newQuestionNumber}][referenceImage]','section[${activeSection}]question[${newQuestionNumber}][uploadedImage]');`);
    $(this).find('input[type="hidden"]input[id*="referenceImage"]').attr('id', `section[${activeSection}]question[${newQuestionNumber}][referenceImage]`);
    $(this).find('input[type="hidden"]input[name*="referenceImage"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][referenceImage]`);

    $(this).find('img').attr('id', `section[${activeSection}]question[${newQuestionNumber}][uploadedImage]`);

    $(this).find('.options label[for^="option"]').each(function () {
      const optionNumber = $(this).attr('for').match(/\d+/)[0];
      $(this).attr('for', `option${optionNumber}_${newQuestionNumber}`);
    });

    $(this).find('.options input[id^="option"]').each(function () {
      const optionNumber = $(this).attr('id').match(/\d+/)[0];
      $(this).attr('id', `option${optionNumber}_${newQuestionNumber}`);
    });

    $(this).find('.options input[name^="section"][type="text"]input[name*="option"]').each(function () {
      const optionNumber = $(this).attr('name').match(/\d+/gi).map(Number)[2];
      $(this).attr('name', `section[${activeSection}]question[${newQuestionNumber}][option${optionNumber}]`);
    });
    $(this).find('.options input[name^="section"][type="radio"]input[name*="correctOption"]').each(function () {
      const optionNumber = $(this).attr('name').match(/\d+/gi).map(Number)[1];
      $(this).attr('name', `section[${activeSection}]question[${newQuestionNumber}][correctOption]`);
    });

    $(this).find('input[name^="section"]input[name*="answer"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][answer]`);
    $(this).find('input[id^="answer"]').attr('id', `answer${newQuestionNumber}`);

    $(this).find('input[name^="section"]input[name*="questionType"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][questionType]`);
    $(this).find('input[id^="questionType"]').attr('id', `questionType${newQuestionNumber}`);

    $(this).find('.removeQuestionBtn').attr('data-question', newQuestionNumber);
  });
  UpdateTotalPoints()
}

function updateSectionNumbers() {
  $('.mySection').each(function (index) {
    const newSectionCounter = index + 1;
    // Update section ID
    $(this).attr('id', 'accordionSection' + newSectionCounter);
    $(this).attr('data-section', newSectionCounter);
    // Update section data attribute

    $(this).find('.accordion-button').attr('data-bs-target', '#section' + newSectionCounter);
    $(this).find('.accordion-button').attr('aria-controls', 'section' + newSectionCounter);

    // Update input placeholder
    $(this).find('input').attr('placeholder', 'Please enter the section-' + newSectionCounter + ' name');
    // Update Max-Points ID
    $(this).find('.sectionScore').attr('id', 'sectionScore' + newSectionCounter);

    // Update data-bs-parent attribute
    $(this).find('.accordion-collapse').attr('data-bs-parent', '#accordionSection' + newSectionCounter);
    $(this).find('.accordion-collapse').attr('id', 'section' + newSectionCounter);

    // Update questionsContainer ID
    $(this).find('.accordion-body').attr('id', 'questionsContainer' + newSectionCounter);

    $(this).find('.removeSectionBtn').attr('data-section', newSectionCounter);
  });
}

function submitForm() {
  var formData = {};
  var sections = document.querySelectorAll('.section');
  let i = 1;
  formData.Title = document.getElementById("AssessmentTitle").value;
  formData.Description = document.getElementById("AssessmentDescription").value;
  //formData.Date = document.getElementById("AssessmentDate").value;
  formData.Duration = document.getElementById("AssessmentDuration").value;
  formData.Cutoff = document.getElementById("AssessmentCutoff").value;
  formData.CertificateName = document.getElementById("AssessmentCertificateName").value;
  let TotalScore = 0;
  sections.forEach(function (section) {
    var sectionData = {};
    var sectionId = "Section" + i;
    var SectionWiseMarks = 0;
    sectionData.SectionName = section.querySelector('input[type="text"][name*="SectionName"]').value;
    var questions = section.querySelectorAll('.question');
    let j = 1;
    questions.forEach(function (question) {
      var questionData = {};
      var questionID = "Question" + j;
      questionData.question = question.querySelector('textarea').value;
      let ImageLoc = question.querySelector('input[type="hidden"][name*="referenceImage"]').value;
      if (ImageLoc.length > 1) {
        questionData.referenceImage = ImageLoc;
      }
      var type = question.querySelector('input[type="hidden"][name*="questionType"]').value;
      if (type == 'MCQ') {
        var options = question.querySelectorAll('input[type="text"]');
      } else if (type == 'Boolean') {
        var options = question.querySelectorAll('input[type="radio"]');
      }

      var optionData = {}, k = 1;
      options.forEach(function (option) {
        var optionID = "Option" + k;
        optionData[optionID] = option.value;
        k++;
      });
      var correctOption = question.querySelector('input[type="radio"]:checked');
      var correctValue = correctOption ? correctOption.value : null;
      var answer = question.querySelector('input[type="hidden"][name*="answer"]').value;
      var point = question.querySelector('input[type="number"][name*="score"]').value;
      SectionWiseMarks += parseInt(point);
      questionData.type = type;
      questionData.point = point;
      questionData.answer = answer;
      questionData.options = optionData;
      questionData.correctOption = correctValue;
      sectionData[questionID] = questionData;
      j++;
    });
    sectionData.MaxScore = SectionWiseMarks;
    TotalScore += SectionWiseMarks;
    formData[sectionId] = sectionData;
    i++
  });
  formData.TotalScore = TotalScore;
  document.getElementById("JsonFormData").value = JSON.stringify(formData);
  console.log(formData);
  document.getElementById("questionnaire").submit();
}

function SubmitAssessment() {
  let answerData = {};
  let sections = document.querySelectorAll('.section');
  let i = 1;
  answerData.AssessmentID = document.getElementById("AssessmentID").value;
  answerData.Remarks = document.getElementById("AssessmentRemarks").value;
  sections.forEach(function (section) {
    var sectionData = {};
    var sectionId = "Section" + i;
    var questions = section.querySelectorAll('.questionn');
    let j = 1;
    questions.forEach(function (question) {
      var questionData = {};
      var questionID = "Question" + j;
      questionData.question = question.querySelector('textarea').value;
      var correctOption = question.querySelector('input[type="radio"]:checked');
      var correctValue = correctOption ? correctOption.value : null;
      questionData.correctOption = correctValue;
      sectionData[questionID] = questionData;
      j++;
    });
    answerData[sectionId] = sectionData;
    i++
  });
  document.getElementById("JsonFormData").value = JSON.stringify(answerData);
  document.getElementById("answerScript").submit();
}


function uploadImage(e, NewLocFieldId, NewImageLoc) {
  const fileInput = document.getElementById(e.id);
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('myQCImage', file);
  axios.post('/api/uploadImage', formData)
    .then(response => {
      document.getElementById(NewLocFieldId).value = response.data;
      displayImage(file, NewImageLoc);
    })
    .catch(error => {
      alert(error.response.data);
      e.value=""
    })
}

function displayImage(file, NewImageLoc) {
  const reader = new FileReader();
  reader.onload = function () {
    console.log(NewImageLoc)
    const uploadedImage = document.getElementById(NewImageLoc);
    uploadedImage.src = reader.result;
    uploadedImage.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function ExpandImage(e) {
  var modalImg = document.getElementById("img01");
  modalImg.src = e.src;
}

function UpdateTotalPoints() {
  let sections = document.querySelectorAll('.section');
  let i = 1, total = 0;
  sections.forEach(function (section) {
    let SectionWiseMarks = 0;
    let questions = section.querySelectorAll('.question');
    questions.forEach(function (question) {
      let point = question.querySelector('input[type="number"][name*="score"]').value;
      if (parseInt(point) > 0) {
        SectionWiseMarks += parseInt(point);
      }
    });
    section.querySelector('span[id*="sectionScore"]').innerHTML = SectionWiseMarks;
    total += SectionWiseMarks;
  });
  (total > 0) ? document.getElementById("AssessmentTotalMarks").value = total : 0;

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

