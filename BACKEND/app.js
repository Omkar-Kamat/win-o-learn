/**
 * File: app.js
 * Description: Implementation of app.js
 */
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import AuthRoutes from './routes/Auth.routes.js';
import UserRoutes from './routes/User.routes.js';
import HackathonRoutes from './routes/Hackathon.routes.js';
import TeamRoutes from './routes/Team.routes.js';
import { hackathonScopedRouter, registrationScopedRouter } from './routes/Registration.routes.js';
import ErrorHandler from './middlewares/ErrorHandler.js';
import { hackathonScopedSubmissionRoutes, submissionRoutes } from './routes/Submission.routes.js';

import hackathonJudgeRoutes from "./routes/HackathonJudge.routes.js";
import judgeRoutes from "./routes/Judge.routes.js";
import ReviewRoutes from './routes/Review.routes.js';
import LeaderboardRoutes from './routes/Leaderboard.routes.js';
import DashboardRoutes from './routes/Dashboard.routes.js';

const app = express();
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});


app.use('/api', ReviewRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/hackathons', HackathonRoutes);
app.use('/api/teams', TeamRoutes);
app.use('/api/hackathons', hackathonScopedRouter);
app.use('/api/registrations', registrationScopedRouter);
app.use('/api/hackathons', hackathonScopedSubmissionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use("/api/hackathons", hackathonJudgeRoutes);
app.use("/api/judges", judgeRoutes);
app.use('/api/hackathons', LeaderboardRoutes);
app.use('/api/dashboard', DashboardRoutes);

app.use(ErrorHandler);

export default app;
