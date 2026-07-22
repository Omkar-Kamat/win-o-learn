import { body, validationResult } from "express-validator";

const nameValidation = () =>
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Team name is required.")
    .bail()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage(
      "Team name must be between 3 and 50 characters."
    );

const membersValidation = () =>
  body("members")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Members must be a non-empty array.");

const membersCannotContainLeaderValidation = () =>
  body("members").custom((members = [], { req }) => {
    if (
      members.some(
        (member) => member === req.user._id.toString()
      )
    ) {
      throw new Error(
        "Do not include yourself in members."
      );
    }

    return true;
  });

const protectedCreateFieldsValidation = () => [
  body("createdAt")
    .not()
    .exists()
    .withMessage("createdAt cannot be provided."),

  body("updatedAt")
    .not()
    .exists()
    .withMessage("updatedAt cannot be provided."),

  body("leader")
    .not()
    .exists()
    .withMessage("Leader cannot be provided."),
];

const protectedUpdateFieldsValidation = () => [
  body("createdAt")
    .not()
    .exists()
    .withMessage("createdAt cannot be updated."),

  body("updatedAt")
    .not()
    .exists()
    .withMessage("updatedAt cannot be updated."),

  body("leader")
    .not()
    .exists()
    .withMessage("Leader cannot be updated."),

  body("members")
    .not()
    .exists()
    .withMessage("Members cannot be updated."),

  body("pendingInvites")
    .not()
    .exists()
    .withMessage("Pending invites cannot be updated."),
];

const memberIdValidation = () =>
  body("members.*")
    .isMongoId()
    .withMessage("Invalid member id.");

const uniqueMembersValidation = () =>
  body("members").custom((members = []) => {
    const unique = new Set(members);

    if (unique.size !== members.length) {
      throw new Error(
        "Duplicate members are not allowed."
      );
    }

    return true;
  });

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

const descriptionValidation = () =>
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      "Description cannot exceed 500 characters."
    );


const inviteEmailValidation = () =>
  body("email")
    .exists({ values: "falsy" })
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Invalid email.")
    .normalizeEmail();



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
    throw new Error("At least one field must be provided.");
  }

  return true;
  }),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage(
      "Team name must be between 3 and 50 characters."
    ),

  descriptionValidation(),

  ...protectedUpdateFieldsValidation(),

  validate,
];

export const validateInviteMember = [
  inviteEmailValidation(),
  validate,
];