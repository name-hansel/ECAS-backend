const { body, validationResult, param, check } = require('express-validator');
const { isValidObjectId } = require("mongoose")

const sendErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array() });
  next();
}

exports.idValidator = [
  param("_id").custom(value => {
    // Custom validator to check if id is a valid object id
    if (!isValidObjectId(value)) {
      throw new Error("ID is not valid")
    }
    return true
  }), sendErrors
]

exports.examCellValidator = [
  body('employeeId')
    .notEmpty().withMessage("Employee ID is required")
    .bail()
    .trim()
    .isString().withMessage("Employee ID is invalid"),
  body('firstName')
    .notEmpty().withMessage("First name is required")
    .bail()
    .trim()
    .isString().withMessage("First name is invalid"),
  body('lastName')
    .notEmpty().withMessage("Last name is required")
    .bail()
    .trim()
    .isString().withMessage("Last name is invalid"),
  body('email')
    .notEmpty().withMessage("Email is required")
    .bail()
    .trim()
    .isString().withMessage("Email is invalid")
    .isEmail().withMessage("Email is invalid"),
  body('phoneNumber')
    .notEmpty().withMessage("Phone number is required")
    .bail()
    .trim()
    .isString().withMessage("Phone number is invalid")
    .isMobilePhone("en-IN").withMessage("Phone number is invalid"), sendErrors
]

exports.branchValidator = [
  body('code')
    .notEmpty().withMessage('Branch code is required')
    .bail()
    .isString().withMessage('Branch code is invalid'),
  body('name')
    .notEmpty().withMessage('Branch name is required')
    .bail()
    .isString().withMessage('Branch name is required')
  , sendErrors
]

exports.studentValidator = [
  body('admissionNumber')
    .notEmpty().withMessage('Admission number is required')
    .bail()
    .isString().withMessage('Admission number is invalid'),
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .bail()
    .isString().withMessage('First name is invalid'),
  body('middleName')
    .optional()
    .isString().withMessage('Middle name is invalid'),
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .bail()
    .isString().withMessage('Last name is invalid'),
  body('branch')
    .notEmpty().withMessage('Branch is required')
    .bail()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error("ID is not valid")
      }
      return true
    }),
  body('currentSemester')
    .notEmpty().withMessage('Current semester is required')
    .bail()
    .isNumeric().withMessage('Current semester is invalid'),
  body('currentDivision')
    .notEmpty().withMessage('Current division is required')
    .bail()
    .isString().isLength({ min: 1, max: 1 }).withMessage('Current division is invalid'),
  body('email')
    .notEmpty().withMessage("Email is required")
    .bail()
    .trim()
    .isString().withMessage("Email is invalid")
    .isEmail().withMessage("Email is invalid"),
  body('phoneNumber')
    .notEmpty().withMessage("Phone number is required")
    .bail()
    .trim()
    .isString().withMessage("Phone number is invalid")
    .isMobilePhone("en-IN").withMessage("Phone number is invalid"), sendErrors
]

exports.studentsValidator = [
  check('students.*.admissionNumber')
    .notEmpty().withMessage('Admission number is required')
    .bail()
    .isString().withMessage('Admission number is invalid'),
  check('students.*.firstName')
    .notEmpty().withMessage('First name is required')
    .bail()
    .isString().withMessage('First name is invalid'),
  check('students.*.middleName')
    .optional()
    .isString().withMessage('Middle name is invalid'),
  check('students.*.lastName')
    .notEmpty().withMessage('Last name is required')
    .bail()
    .isString().withMessage('Last name is invalid'),
  check('students.*.branch')
    .notEmpty().withMessage('Branch is required')
    .bail()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error("ID is not valid")
      }
      return true
    }),
  check('students.*.currentSemester')
    .notEmpty().withMessage('Current semester is required')
    .bail()
    .isNumeric().withMessage('Current semester is invalid'),
  check('students.*.currentDivision')
    .notEmpty().withMessage('Current division is required')
    .bail()
    .isString().isLength({ min: 1, max: 1 }).withMessage('Current division is invalid'),
  check('students.*.email')
    .notEmpty().withMessage("Email is required")
    .bail()
    .trim()
    .isString().withMessage("Email is invalid")
    .isEmail().withMessage("Email is invalid"),
  check('students.*.phoneNumber')
    .notEmpty().withMessage("Phone number is required")
    .bail()
    .trim()
    .isString().withMessage("Phone number is invalid")
    .isMobilePhone("en-IN").withMessage("Phone number is invalid"), sendErrors
]

exports.facultyValidator = [
  body('employeeId')
    .notEmpty().withMessage("Employee ID is required")
    .bail()
    .trim()
    .isString().withMessage("Employee ID is invalid"),
  body('firstName')
    .notEmpty().withMessage("First name is required")
    .bail()
    .trim()
    .isString().withMessage("First name is invalid"),
  body('lastName')
    .notEmpty().withMessage("Last name is required")
    .bail()
    .trim()
    .isString().withMessage("Last name is invalid"),
  body('email')
    .notEmpty().withMessage("Email is required")
    .bail()
    .trim()
    .isString().withMessage("Email is invalid")
    .isEmail().withMessage("Email is invalid"),
  body('department')
    .notEmpty().withMessage('Department is required')
    .bail()
    .trim()
    .isString().withMessage('Department is invalid'),
  sendErrors
]

exports.noticeValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .bail()
    .isString().withMessage('Title is invalid'),
  body('description')
    .optional()
    .isString().withMessage('Description is invalid'),
  check('branch.*')
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error("ID is not valid")
      }
      return true
    }),
  check('year.*')
    .isNumeric().withMessage('Year is invalid'),
  check('files.*')
    .optional()
    .isString().withMessage('File name is invalid'),
  body('sendNotification')
    .notEmpty().withMessage('Send notification option is required')
    .bail()
    .isBoolean().withMessage('Invalid send notification option'),
  body('sendEmailIn')
    .optional()
    .isNumeric().withMessage('Invalid deletion period'),
  sendErrors
]

exports.faqValidator = [
  body('question')
    .optional()
    .isString().withMessage('Question is invalid'),
  body('answer')
    .notEmpty().withMessage('Answer is required')
    .bail()
    .isString().withMessage('Answer is invalid'),
  sendErrors
]

exports.seatingArrangementValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .bail()
    .isString().withMessage('Invalid title'),
  body('dateOfExam')
    .notEmpty().withMessage('Date of exam is required')
    .bail(),
  sendErrors
]

exports.quizValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .bail()
    .isString().withMessage('Invalid title'),
  body('course')
    .notEmpty().withMessage('Course is required')
    .bail()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error("Course ID is not valid")
      }
      return true
    }),
  body('numberOfQuestionsInQuiz')
    .notEmpty().withMessage('Number of questions in quiz is required')
    .bail()
    .isNumeric().withMessage('Invalid number of questions in quiz'),
  body('rows')
    .notEmpty().withMessage('Number of rows is required')
    .bail()
    .isNumeric().withMessage('Invalid number of rows'),
  body('columns')
    .notEmpty().withMessage('Number of columns is required')
    .bail()
    .isNumeric().withMessage('Invalid number of columns'),
  body('numberOfStudents')
    .notEmpty().withMessage('Number of students is required')
    .bail()
    .isNumeric().withMessage('Invalid number of students'),
  body('division')
    .notEmpty().withMessage('Division is required')
    .bail()
    .isString().withMessage('Invalid division'),
  sendErrors
]

exports.courseValidator = [
  body('code')
    .notEmpty().withMessage('Course code is required')
    .bail()
    .isString().withMessage('Invalid course code'),
  body('name')
    .notEmpty().withMessage('Course name is required')
    .bail()
    .isString().withMessage('Invalid course name'),
  body('semester')
    .notEmpty().withMessage('Course semester is required')
    .bail()
    .isNumeric().withMessage('Invalid course semester'),
  body('branch')
    .notEmpty().withMessage('Branch is required')
    .bail()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error("ID is not valid")
      }
      return true
    }),
  body('mandatory')
    .optional()
    .isBoolean().withMessage('Course mandatory status is invalid'),
  sendErrors
]