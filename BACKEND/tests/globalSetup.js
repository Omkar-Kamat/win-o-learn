import fs from 'fs';
import path from 'path';

export default async () => {
  const logFile = path.resolve('tests/logs/test-run.log');
  const readableLogFile = path.resolve('tests/logs/test-run-readable.md');
  const logDir = path.dirname(logFile);
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  if (fs.existsSync(readableLogFile)) fs.unlinkSync(readableLogFile);
};
