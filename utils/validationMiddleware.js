const { body, validationResult, param } = require('express-validator');
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

exports.academicSessionValidator = [
  body('from')
    .notEmpty().withMessage("From year is required")
    .bail()
    .isNumeric().withMessage("From year is invalid"),
  body('to')
    .notEmpty().withMessage("To year is required")
    .bail()
    .isNumeric().withMessage("To year is invalid"),
  body('session')
    .notEmpty().withMessage("Session is required")
    .bail()
    .trim()
    .isString().withMessage("Session is invalid"),
  , sendErrors
]

exports.branchValidator = [
  body('code')
    .notEmpty().withMessage('Branch code is required')
    .bail()
    .isString().withMessage('Branch code is invalid'),
  body('name')
    .notEmpty().withMessage('Branch name is required')
    .bail()
    .isString().withMessage('Branch name is required'),
  , sendErrors
]