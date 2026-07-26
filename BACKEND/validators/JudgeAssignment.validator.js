import { body, param, validationResult } from 'express-validator';
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }
    next();
};
export const validateAssignJudge = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .bail()
        .isEmail()
        .withMessage('Invalid email address.'),
    validate,
];
export const validateHackathonId = [
    param('hackathonId').isMongoId().withMessage('Invalid hackathon ID.'),
    validate,
];
export const validateJudgeId = [
    param('judgeId').isMongoId().withMessage('Invalid judge ID.'),
    validate,
];
