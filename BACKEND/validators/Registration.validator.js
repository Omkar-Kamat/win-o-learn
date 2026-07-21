import { body, param, query, validationResult } from "express-validator";

const hackathonIdValidation = () =>
  param("hackathonId")
    .isMongoId()
    .withMessage("Invalid hackathon id.");

const teamBodyValidation = () =>
  body("teamId")
    .exists({ checkFalsy: true })
    .withMessage("Team id is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid team id.");

const teamParamValidation = () =>
  param("teamId")
    .isMongoId()
    .withMessage("Invalid team id.");

const registrationIdValidation = () =>
  param("registrationId")
    .isMongoId()
    .withMessage("Invalid registration id.");

const protectedFieldsValidation = () => [
  body("status")
    .not()
    .exists()
    .withMessage("Status cannot be provided."),

  body("respondedBy")
    .not()
    .exists()
    .withMessage("respondedBy cannot be provided."),

  body("respondedAt")
    .not()
    .exists()
    .withMessage("respondedAt cannot be provided."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array(),
    });
  }

  next();
};

export const validateRegister = [
  hackathonIdValidation(),
  teamBodyValidation(),
  ...protectedFieldsValidation(),
  validate,
];

export const validateCancelRegistration = [
  hackathonIdValidation(),
  teamParamValidation(),
  validate,
];

export const validateRegistrationStatus = [
  hackathonIdValidation(),
  teamParamValidation(),
  validate,
];

export const validateHackathonRegistrations = [
  hackathonIdValidation(),
  query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Invalid status"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  validate,
];

export const validateRegistrationId = [
  registrationIdValidation(),
  validate,
];