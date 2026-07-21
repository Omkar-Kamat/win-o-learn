import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

import AuthRoutes from "./routes/Auth.routes.js";
import UserRoutes from "./routes/User.routes.js";
import HackathonRoutes from "./routes/Hackathon.routes.js";
import TeamRoutes from "./routes/Team.routes.js";
import RegistrationRoutes from "./routes/Registration.routes.js";

import ErrorHandler from "./middlewares/ErrorHandler.js";

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


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/hackathons", HackathonRoutes);
app.use("/api/teams", TeamRoutes);
app.use("/api/registrations", RegistrationRoutes)

app.use(ErrorHandler);

export default app;