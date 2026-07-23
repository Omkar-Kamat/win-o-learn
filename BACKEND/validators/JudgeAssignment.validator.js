import { body, param, validationResult } from "express-validator";

// Performs the validate operation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: errors.array(),
        });
    }
    next();
};

export const validateAssignJudge =[
  body("judgeId")
    .trim()
    .notEmpty()
    .withMessage("Judge ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid judge ID."),
    validate
];

export const validateHackathonId = [
  param("hackathonId")
    .isMongoId()
    .withMessage("Invalid hackathon ID."),
    validate
];

export const validateJudgeId = [
  param("judgeId")
    .isMongoId()
    .withMessage("Invalid judge ID."),
    validate
];

