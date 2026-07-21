import mongoose from "mongoose";

const judgingCriteriaSchema = new mongoose.Schema(
  {
    criterion: {
      type: String,
      required: true,
      trim: true,
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
  },
  { _id: false }
);

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    theme: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },

    venue: {
      type: String,
      default: "",
      trim: true,
    },

    registrationStartDate: {
      type: Date,
      required: true,
    },

    registrationDeadline: {
      type: Date,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    banner: {
      type: String,
      default: "",
    },

    bannerPublicId: {
      type: String,
      default: null,
    },

    prizePool: {
      type: Number,
      required: true,
      min: 0,
    },

    maxTeamSize: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    rules: [
      {
        type: String,
        trim: true,
        maxLength: 200,
      },
    ],

    judgingCriteria: {
      type: [judgingCriteriaSchema],
      default: [],
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registrationOpen: {
      type: Boolean,
      default: false,
    },

    resultsPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

hackathonSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

export default Hackathon;