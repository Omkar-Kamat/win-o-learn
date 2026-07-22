import mongoose from "mongoose";

const { Schema, model } = mongoose;

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    pendingInvites: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        invitedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ leader: 1 });

teamSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default model("Team", teamSchema);