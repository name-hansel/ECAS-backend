const { body, validationResult, param } = require('express-validator');
const { isValidObjectId } = require("mongoose")

exports.idValidator = [
  param("_id").custom(value => {
    // Custom validator to check if id is a valid object id
    if (!isValidObjectId(value)) {
      throw new Error("ID is not valid")
    }
    return true
  }), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    next();
  }
]

exports.examCellValidator = [
  body('employeeId', 'Employee Id is required')
    .notEmpty().withMessage("Employee ID is required")
    .bail()
    .trim()
    .isString().withMessage("Employee ID is invalid"),
  body('firstName', "First name is required")
    .bail()
    .trim()
    .notEmpty().withMessage("First name is required")
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
    .isMobilePhone("en-IN").withMessage("Phone number is invalid"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    next();
  }
]