import { body } from "express-validator";
import validate from "../middlewares/validate.js";

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
    .isIn([
      "Pending",
      "Under Review",
      "Approved",
      "Rejected",
    ])
    .withMessage("Invalid submission status."),

  validate,
];