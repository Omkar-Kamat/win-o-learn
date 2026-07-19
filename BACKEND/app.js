import "dotenv/config";
import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;