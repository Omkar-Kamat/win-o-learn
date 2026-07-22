import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      unique: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    problemStatement: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    solutionDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    githubRepo: {
      type: String,
      trim: true,
      default: "",
    },

    liveDemoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    techStack: [
      {
        type: String,
        trim: true,
      },
    ],

    screenshots: [
      {
        type: String,
      },
    ],

    presentation: {
      type: String,
      default: "",
    },

    demoVideo: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model(
  "Submission",
  submissionSchema
);

export default Submission;