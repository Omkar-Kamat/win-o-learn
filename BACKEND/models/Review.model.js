import mongoose from 'mongoose';
const reviewScoreSchema = new mongoose.Schema(
    {
        criterion: { type: String, required: true, trim: true },
        score: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);
const reviewSchema = new mongoose.Schema(
    {
        submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
        hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
        judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        scores: {
            type: [reviewScoreSchema],
            validate: {
                validator(value) {
                    return value.length > 0;
                },
                message: 'At least one score is required.',
            },
        },
        totalScore: { type: Number, required: true, default: 0 },
        feedback: { type: String, trim: true, maxlength: 5e3, default: '' },
        isFinal: { type: Boolean, default: false },
    },
    { timestamps: true }
);
reviewSchema.index({ submission: 1, judge: 1 }, { unique: true });
reviewSchema.set('toJSON', {
    transform(doc, ret) {
        delete ret.__v;
        return ret;
    },
});
export default mongoose.model('Review', reviewSchema);
