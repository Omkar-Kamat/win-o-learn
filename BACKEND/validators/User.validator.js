import { body, param, validationResult } from "express-validator";

import { ROLES } from "../utils/Constants.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

export const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("bio")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Bio cannot exceed 300 characters"),

  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array"),

  body("skills.*")
    .optional()
    .isString()
    .withMessage("Each skill must be a string"),

  body("socials.github")
    .optional()
    .isURL()
    .withMessage("Invalid GitHub URL"),

  body("socials.linkedin")
    .optional()
    .isURL()
    .withMessage("Invalid LinkedIn URL"),

  body("socials.portfolio")
    .optional()
    .isURL()
    .withMessage("Invalid Portfolio URL"),

  body(["email", "password", "role", "isBlocked"])
    .not()
    .exists()
    .withMessage("These fields cannot be updated"),

  handleValidationErrors,
];

export const validateUserId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID"),

  handleValidationErrors,
];

export const validateRoleUpdate = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn([
      ROLES.PARTICIPANT,
      ROLES.ORGANIZER,
      ROLES.JUDGE,
    ])
    .withMessage("Invalid role"),

  handleValidationErrors,
];

export const validateAdminUpdate = [
  ...validateUserId.slice(0, 1),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("bio")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Bio cannot exceed 300 characters"),

  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array"),

  body("socials.github")
    .optional()
    .isURL()
    .withMessage("Invalid GitHub URL"),

  body("socials.linkedin")
    .optional()
    .isURL()
    .withMessage("Invalid LinkedIn URL"),

  body("socials.portfolio")
    .optional()
    .isURL()
    .withMessage("Invalid Portfolio URL"),

  body(["password", "role", "isBlocked"])
    .not()
    .exists()
    .withMessage("Use dedicated endpoints for password, role, and block status"),

  handleValidationErrors,
];