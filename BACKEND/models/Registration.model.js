import mongoose from "mongoose";

const { Schema, model } = mongoose;

const registrationSchema = new Schema(
  {
    hackathon: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index(
  {
    hackathon: 1,
    team: 1,
  },
  {
    unique: true,
  }
);

registrationSchema.set("toJSON", { transform(doc, ret) { delete ret.__v; return ret; } });

export default model(
  "Registration",
  registrationSchema
);