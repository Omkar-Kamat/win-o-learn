/**
 * File: Team.validator.js
 * Description: Implementation of Team.validator.js
 */
import { body, param, validationResult } from 'express-validator';

// Performs the name validation operation
const nameValidation = () =>
    body('name')
        .exists({
            checkFalsy: true,
        })
        .withMessage('Team name is required.')
        .bail()
        .trim()
        .isLength({
            min: 3,
            max: 50,
        })
        .withMessage('Team name must be between 3 and 50 characters.');

// Performs the members validation operation
const membersValidation = () =>
    body('members')
        .optional()
        .isArray({
            min: 1,
        })
        .withMessage('Members must be a non-empty array.');

// Performs the members cannot contain leader validation operation
const membersCannotContainLeaderValidation = () =>
    body('members').custom((members = [], { req }) => {
        if (members.some((member) => member === req.user._id.toString())) {
            throw new Error('Do not include yourself in members.');
        }

        return true;
    });

// Performs the protected create fields validation operation
const protectedCreateFieldsValidation = () => [
    body('createdAt').not().exists().withMessage('createdAt cannot be provided.'),
    body('updatedAt').not().exists().withMessage('updatedAt cannot be provided.'),
    body('leader').not().exists().withMessage('Leader cannot be provided.'),
    body('pendingInvites').not().exists().withMessage('Pending invites cannot be provided.'),
];

// Performs the protected update fields validation operation
const protectedUpdateFieldsValidation = () => [
    body('createdAt').not().exists().withMessage('createdAt cannot be updated.'),
    body('updatedAt').not().exists().withMessage('updatedAt cannot be updated.'),
    body('leader').not().exists().withMessage('Leader cannot be updated.'),
    body('members').not().exists().withMessage('Members cannot be updated.'),
    body('pendingInvites').not().exists().withMessage('Pending invites cannot be updated.'),
];

// Performs the member id validation operation
const memberIdValidation = () => body('members.*').isMongoId().withMessage('Invalid member id.');

// Performs the user id validation operation
const userIdValidation = () => param('userId').isMongoId().withMessage('Invalid user ID.');

// Performs the unique members validation operation
const uniqueMembersValidation = () =>
    body('members').custom((members = []) => {
        const unique = new Set(members);
        if (unique.size !== members.length) {
            throw new Error('Duplicate members are not allowed.');
        }

        return true;
    });

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


// Performs the description validation operation
const descriptionValidation = () =>
    body('description')
        .optional()
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage('Description cannot exceed 500 characters.');

// Performs the invite email validation operation
const inviteEmailValidation = () =>
    body('email')
        .exists({
            checkFalsy: true,
        })
        .withMessage('Email is required.')
        .bail()
        .isEmail()
        .withMessage('Invalid email.')
        .normalizeEmail();

// Performs the new leader validation operation
const newLeaderValidation = () =>
    body('userId')
        .exists({
            checkFalsy: true,
        })
        .withMessage('User ID is required.')
        .bail()
        .isMongoId()
        .withMessage('Invalid user ID.');
export const validateCreateTeam = [
    nameValidation(),
    membersValidation(),
    memberIdValidation(),
    uniqueMembersValidation(),
    membersCannotContainLeaderValidation(),
    ...protectedCreateFieldsValidation(),
    validate,
];
export const validateUpdateTeam = [
    body().custom((value) => {
        if (!value || Object.keys(value).length === 0) {
            throw new Error('At least one field must be provided.');
        }

        return true;
    }),
    body('name')
        .optional()
        .trim()
        .isLength({
            min: 3,
            max: 50,
        })
        .withMessage('Team name must be between 3 and 50 characters.'),
    descriptionValidation(),
    ...protectedUpdateFieldsValidation(),
    validate,
];
export const validateInviteMember = [inviteEmailValidation(), validate];
export const validateTransferLeadership = [newLeaderValidation(), validate];
export const validateRemoveMember = [userIdValidation(), validate];
export const validateTeamId = [param('id').isMongoId().withMessage('Invalid team ID.'), validate];
