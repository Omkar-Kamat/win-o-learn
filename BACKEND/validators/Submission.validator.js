import { body, query, param, validationResult } from "express-validator";

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

export const validateCreateSubmission = [
  body("projectName")
    .trim()
    .notEmpty()
    .withMessage("Project name is required."),

  body("problemStatement")
    .trim()
    .notEmpty()
    .withMessage("Problem statement is required."),

  body("solutionDescription")
    .trim()
    .notEmpty()
    .withMessage("Solution description is required."),

  body("githubRepo")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("GitHub repository must be a valid URL."),

  body("liveDemoUrl")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Live demo URL must be a valid URL."),

  body("demoVideo")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Demo video must be a valid URL."),

  body("presentation")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Presentation must be a valid URL."),

  body("techStack")
    .optional()
    .isArray()
    .withMessage("Tech stack must be an array."),

  validate,
];

export const validateUpdateSubmission = [
  body("projectName").optional().trim().notEmpty(),

  body("problemStatement").optional().trim().notEmpty(),

  body("solutionDescription").optional().trim().notEmpty(),

  body("githubRepo")
    .optional({ checkFalsy: true })
    .isURL(),

  body("liveDemoUrl")
    .optional({ checkFalsy: true })
    .isURL(),

  body("presentation")
    .optional({ checkFalsy: true })
    .isURL(),

  body("demoVideo")
    .optional({ checkFalsy: true })
    .isURL(),

  body("techStack")
    .optional()
    .isArray(),

  validate,
];

export const validateSubmissionStatus = [
  body("status")
    .isIn(["pending", "under_review", "approved", "rejected"])
    .withMessage("Invalid submission status."),

  validate,
];

export const validateGetMySubmission = [
  query("teamId")
    .isMongoId()
    .withMessage("Valid teamId query param is required."),

  validate,
];

export const validateHackathonIdParam = [
  param("hackathonId").isMongoId().withMessage("Invalid hackathon ID."),
  validate,
];

export const validateSubmissionIdParam = [
  param("id").isMongoId().withMessage("Invalid submission ID."),
  validate,
];