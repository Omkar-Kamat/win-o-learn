import mongoose from 'mongoose';
const JudgeAssignmentSchema = new mongoose.Schema(
    {
        hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
        judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        assignedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);
JudgeAssignmentSchema.index({ hackathon: 1, judge: 1 }, { unique: true });
export default mongoose.model('JudgeAssignment', JudgeAssignmentSchema);
