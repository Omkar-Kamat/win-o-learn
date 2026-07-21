import { body } from "express-validator";

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

const protectedFieldsValidation = () => [
  body("createdAt")
    .not()
    .exists()
    .withMessage("createdAt cannot be provided."),
  body("updatedAt")
    .not()
    .exists()
    .withMessage("updatedAt cannot be provided."),
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

const leaderValidation = () =>
  body("leader")
    .not()
    .exists()
    .withMessage(
      "Leader cannot be provided."
    );

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

export const validateCreateTeam = [
  nameValidation(),
  membersValidation(),
  memberIdValidation(),
  uniqueMembersValidation(),
  membersCannotContainLeaderValidation(),
  leaderValidation(),
  ...protectedFieldsValidation(),
  validate(),
];