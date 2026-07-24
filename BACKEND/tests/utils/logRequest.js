import fs from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../../app.js';

export const logRequest = (suite, caseName, method, route, res, reqHeaders = {}, reqBody = {}) => {
  const logFile = path.resolve('tests/logs/test-run.log');
  
  const entry = {
    suite,
    case: caseName,
    method: method.toUpperCase(),
    route,
    headers: reqHeaders,
    body: reqBody,
    statusCode: res.status,
    responseBody: res.body || res.text,
    timestamp: new Date().toISOString()
  };
  
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Append entry as JSONL
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
};

export const logged = async (method, url, { body, token, headers = {}, suite = 'Unknown Suite', caseName = 'Unknown Case', attach = [] } = {}) => {
  const req = request(app)[method.toLowerCase()](url);
  
  const reqHeaders = { ...headers };
  if (token) {
    reqHeaders['Cookie'] = `accessToken=${token}`;
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  for (const [key, val] of Object.entries(reqHeaders)) {
    req.set(key, val);
  }

  // Attach files if provided
  if (attach.length > 0) {
    for (const file of attach) {
      req.attach(file.field, file.path);
    }
    if (body) {
      for (const [key, val] of Object.entries(body)) {
        req.field(key, val);
      }
    }
  } else if (body) {
    req.send(body);
  }

  const res = await req;
  
  // Keep body for logging, excluding password fields if needed but prompt says:
  // "Keep validation-only sensitive data (like passwords) unmasked in this log since it's for local dev/debugging"
  
  logRequest(suite, caseName, method, url, res, reqHeaders, attach.length > 0 ? '[Multipart Form Data]' : body);
  return res;
};
