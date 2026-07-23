/**
 * File: Submission.model.js
 * Description: Implementation of Submission.model.js
 */
import mongoose from 'mongoose';
const submissionSchema = new mongoose.Schema(
    {
        registration: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Registration',
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
            default: '',
        },
        liveDemoUrl: {
            type: String,
            trim: true,
            default: '',
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
            default: '',
        },
        demoVideo: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'under_review', 'approved', 'rejected'],
            default: 'pending',
        },
        
        averageScore: {
            type: Number,
            default: 0,
        },

        reviewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

submissionSchema.set('toJSON', {
    // Performs the transform operation
    transform(doc, ret) {
        delete ret.__v;

        return ret;
    },
});


const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
