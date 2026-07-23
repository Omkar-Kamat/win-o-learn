import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import AuthRoutes from './routes/Auth.routes.js';
import UserRoutes from './routes/User.routes.js';
import HackathonRoutes from './routes/Hackathon.routes.js';
import TeamRoutes from './routes/Team.routes.js';
import { hackathonScopedRouter, registrationScopedRouter } from './routes/Registration.routes.js';
import ErrorHandler from './middlewares/ErrorHandler.js';
import { hackathonScopedSubmissionRoutes, submissionRoutes } from './routes/Submission.routes.js';
import hackathonJudgeRoutes from './routes/HackathonJudge.routes.js';
import judgeRoutes from './routes/Judge.routes.js';
import {
    submissionScopedReviewRouter,
    hackathonScopedReviewRouter,
    reviewRouter,
    judgeScopedReviewRouter,
} from './routes/Review.routes.js';
import LeaderboardRoutes from './routes/Leaderboard.routes.js';
import DashboardRoutes from './routes/Dashboard.routes.js';
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const swaggerDocument = JSON.parse(fs.readFileSync(new URL('./swagger-output.json', import.meta.url), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/auth', AuthRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/hackathons', HackathonRoutes);
app.use('/api/teams', TeamRoutes);
app.use('/api/hackathons', hackathonScopedRouter);
app.use('/api/registrations', registrationScopedRouter);
app.use('/api/hackathons', hackathonScopedSubmissionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/hackathons', hackathonJudgeRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/hackathons', LeaderboardRoutes);
app.use('/api/reviews', reviewRouter);
app.use('/api/submissions', submissionScopedReviewRouter);
app.use('/api/hackathons', hackathonScopedReviewRouter);
app.use('/api/judges', judgeScopedReviewRouter);
app.use('/api/dashboard', DashboardRoutes);
app.use(ErrorHandler);
export default app;
