import { body, param, query, validationResult } from "express-validator";

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

export const validateHackathonId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid hackathon ID"),

  handleValidationErrors,
];

export const validateListHackathons = [
  query("mode")
    .optional()
    .isIn(["online", "offline"])
    .withMessage("Invalid mode"),

  query("registrationOpen")
    .optional()
    .isBoolean()
    .withMessage("registrationOpen must be true or false"),

  query("timeStatus")
    .optional()
    .isIn([
      "upcoming",
      "ongoing",
      "completed",
    ])
    .withMessage("Invalid time status"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

const titleValidation = (optional = false) => {
  let validator = body("title")
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters");

  return optional ? validator.optional() : validator.notEmpty();
};

const descriptionValidation = (optional = false) => {
  let validator = body("description")
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage("Description must be between 20 and 5000 characters");

  return optional ? validator.optional() : validator.notEmpty();
};

const themeValidation = (optional = false) => {
  let validator = body("theme")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Theme must be between 2 and 100 characters");

  return optional ? validator.optional() : validator.notEmpty();
};

const modeValidation = (optional = false) => {
  let validator = body("mode")
    .isIn(["online", "offline"])
    .withMessage("Mode must be online or offline");

  return optional ? validator.optional() : validator.notEmpty();
};

const venueValidation = (optional = false) => {
  let validator = body("venue").custom((value, { req }) => {
    const mode =
      req.body.mode ??
      req.hackathon?.mode;

    if (mode === "offline") {
      if (!value || value.trim() === "") {
        throw new Error(
          "Venue is required for offline hackathons"
        );
      }
    }

    return true;
  });

  return optional ? validator.optional() : validator;
};

const prizePoolValidation = (optional = false) => {
  let validator = body("prizePool")
    .isFloat({ min: 0 })
    .withMessage("Prize pool must be a positive number");

  return optional ? validator.optional() : validator.notEmpty();
};

const maxTeamSizeValidation = (optional = false) => {
  let validator = body("maxTeamSize")
    .isInt({ min: 1, max: 10 })
    .withMessage("Maximum team size must be between 1 and 10");

  return optional ? validator.optional() : validator.notEmpty();
};

const rulesValidation = (optional = false) => {
  let validator = body("rules")
    .isArray({ max: 20 })
    .withMessage("Maximum 20 rules are allowed");

  return optional ? validator.optional() : validator.notEmpty();
};

const ruleItemValidation = (optional = false) => {
  let validator = body("rules.*")
    .isLength({ max: 200 })
    .withMessage("Each rule cannot exceed 200 characters");

  return optional ? validator.optional() : validator;
};

const judgingCriteriaValidation = (optional = false) => {
  let validator = body("judgingCriteria")
    .isArray({ min: 1 })
    .withMessage("At least one judging criterion is required");

  return optional ? validator.optional() : validator.notEmpty();
};

const criterionValidation = (optional = false) => {
  let validator = body("judgingCriteria.*.criterion")
    .trim()
    .notEmpty()
    .withMessage("Criterion is required");

  return optional ? validator.optional() : validator;
};

const marksValidation = (optional = false) => {
  let validator = body("judgingCriteria.*.maxMarks")
    .isInt({ min: 1, max: 100 })
    .withMessage("Maximum marks must be between 1 and 100");

  return optional ? validator.optional() : validator;
};

const validateDateOrder = ({
  registrationStartDate,
  registrationDeadline,
  startDate,
  submissionDeadline,
  endDate,
}) => {
  const registrationStart = new Date(registrationStartDate);
  const registrationEnd = new Date(registrationDeadline);
  const hackathonStart = new Date(startDate);
  const submission = new Date(submissionDeadline);
  const hackathonEnd = new Date(endDate);

  if (registrationStart >= registrationEnd) {
    throw new Error(
      "Registration deadline must be after registration start date."
    );
  }

  if (registrationEnd >= hackathonStart) {
    throw new Error(
      "Hackathon start date must be after registration deadline."
    );
  }

  if (hackathonStart > submission) {
    throw new Error(
      "Submission deadline cannot be before hackathon start date."
    );
  }

  if (submission > hackathonEnd) {
    throw new Error(
      "Submission deadline cannot be after hackathon end date."
    );
  }
};

const dateValidation = body().custom((_, { req }) => {
  const {
    registrationStartDate,
    registrationDeadline,
    startDate,
    submissionDeadline,
    endDate,
  } = req.body;

  if (
  !registrationStartDate ||
  !registrationDeadline ||
  !startDate ||
  !submissionDeadline ||
  !endDate
  ) {
    return true;
  }

  validateDateOrder({
    registrationStartDate,
    registrationDeadline,
    startDate,
    submissionDeadline,
    endDate,
  });

  return true;
});

const registrationStartDateValidation = (optional = false) => {
  let validator = body("registrationStartDate");

  if (optional) {
    return validator
      .optional()
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("Invalid registration start date")
      .toDate();
  }

  return validator
    .exists({ checkFalsy: true })
    .withMessage("Registration start date is required")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Invalid registration start date")
    .toDate();
};

const registrationDeadlineValidation = (optional = false) => {
  let validator = body("registrationDeadline");

  if (optional) {
    return validator
      .optional()
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("Invalid registration deadline")
      .toDate();
  }

  return validator
    .exists({ checkFalsy: true })
    .withMessage("Registration deadline is required")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Invalid registration deadline")
    .toDate();
};

const startDateValidation = (optional = false) => {
  let validator = body("startDate");

  if (optional) {
    return validator
      .optional()
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("Invalid hackathon start date")
      .toDate();
  }

  return validator
    .exists({ checkFalsy: true })
    .withMessage("Hackathon start date is required")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Invalid hackathon start date")
    .toDate();
};

const submissionDeadlineValidation = (optional = false) => {
  let validator = body("submissionDeadline");

  if (optional) {
    return validator
      .optional()
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("Invalid submission deadline")
      .toDate();
  }

  return validator
    .exists({ checkFalsy: true })
    .withMessage("Submission deadline is required")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Invalid submission deadline")
    .toDate();
};

const endDateValidation = (optional = false) => {
  let validator = body("endDate");

  if (optional) {
    return validator
      .optional()
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("Invalid hackathon end date")
      .toDate();
  }

  return validator
    .exists({ checkFalsy: true })
    .withMessage("Hackathon end date is required")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Invalid hackathon end date")
    .toDate();
};

const protectedFieldsValidation = body([
  "organizer",
  "registrationOpen",
  "resultsPublished",
  "banner",
  "bannerPublicId",
])
  .not()
  .exists()
  .withMessage(
    "These fields cannot be updated directly"
  );


const updateDateValidation = body().custom((_, { req }) => {
  const hackathon = req.hackathon;

  validateDateOrder({
    registrationStartDate:
      req.body.registrationStartDate ?? hackathon.registrationStartDate,
    registrationDeadline:
      req.body.registrationDeadline ?? hackathon.registrationDeadline,
    startDate: req.body.startDate ?? hackathon.startDate,
    submissionDeadline:
      req.body.submissionDeadline ?? hackathon.submissionDeadline,
    endDate: req.body.endDate ?? hackathon.endDate,
  });

  return true;
});


export const validateCreateHackathon = [
  titleValidation(),
  descriptionValidation(),
  themeValidation(),
  modeValidation(),

  registrationStartDateValidation(),
  registrationDeadlineValidation(),
  startDateValidation(),
  submissionDeadlineValidation(),
  endDateValidation(),

  venueValidation(),
  prizePoolValidation(),
  maxTeamSizeValidation(),
  rulesValidation(),
  ruleItemValidation(),
  judgingCriteriaValidation(),
  criterionValidation(),
  marksValidation(),

  dateValidation,

  protectedFieldsValidation,
  handleValidationErrors,
];

export const validateUpdateHackathon = [
  titleValidation(true),
  descriptionValidation(true),
  themeValidation(true),
  modeValidation(true),

  registrationStartDateValidation(true),
  registrationDeadlineValidation(true),
  startDateValidation(true),
  submissionDeadlineValidation(true),
  endDateValidation(true),

  venueValidation(true),
  prizePoolValidation(true),
  maxTeamSizeValidation(true),
  rulesValidation(true),
  ruleItemValidation(true),
  judgingCriteriaValidation(true),
  criterionValidation(true),
  marksValidation(true),

  updateDateValidation,

  protectedFieldsValidation,
  handleValidationErrors,
];