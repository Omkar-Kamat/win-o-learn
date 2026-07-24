import fs from 'fs';
import path from 'path';

export default class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const logFile = path.resolve('tests/logs/test-run.log');
    const readableLogFile = path.resolve('tests/logs/test-run-readable.md');
    
    if (!fs.existsSync(logFile)) return;
    
    const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean);
    const logEntries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch(e) {
        return null;
      }
    }).filter(Boolean);
    
    // Create a map of test case status: "Suite Name -> Case Name" -> status
    const testStatusMap = {};
    for (const testFile of results.testResults) {
      for (const testCase of testFile.testResults) {
        const suite = testCase.ancestorTitles.join(' > ');
        const name = testCase.title;
        testStatusMap[`${suite}::${name}`] = testCase.status; // 'passed' | 'failed' | 'skipped'
      }
    }
    
    // Group logs by suite
    const grouped = {};
    for (const entry of logEntries) {
      const suite = entry.suite || 'Unknown Suite';
      if (!grouped[suite]) grouped[suite] = [];
      grouped[suite].push(entry);
    }
    
    let summary = '# Test Run Summary\n\n';
    
    for (const [suite, entries] of Object.entries(grouped)) {
      summary += `## ${suite}\n\n`;
      for (const entry of entries) {
        const status = testStatusMap[`${suite}::${entry.case}`] || 'unknown';
        const formattedStatus = status === 'passed' ? '✅ PASS' : (status === 'failed' ? '❌ FAIL' : '⚠️ ' + status.toUpperCase());
        
        summary += `### [${formattedStatus}] ${entry.method.toUpperCase()} ${entry.route} — "${entry.case}"\n`;
        summary += `**Timestamp:** ${entry.timestamp}\n\n`;
        
        if (Object.keys(entry.headers || {}).length > 0) {
          summary += `**Headers:**\n\`\`\`json\n${JSON.stringify(entry.headers, null, 2)}\n\`\`\`\n\n`;
        }
        
        if (entry.body && Object.keys(entry.body).length > 0) {
          summary += `**Request Body:**\n\`\`\`json\n${JSON.stringify(entry.body, null, 2)}\n\`\`\`\n\n`;
        }
        
        summary += `**Response (${entry.statusCode}):**\n\`\`\`json\n${JSON.stringify(entry.responseBody, null, 2)}\n\`\`\`\n\n`;
        summary += `---\n\n`;
      }
    }
    
    fs.writeFileSync(readableLogFile, summary, 'utf8');
    console.log(`\nWritten human-readable log to ${readableLogFile}\n`);
  }
}
