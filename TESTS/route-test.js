import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3000';
const BACKEND_DIR = path.join(__dirname, '..', 'BACKEND');
const APP_JS_PATH = path.join(BACKEND_DIR, 'app.js');

const color = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

const ctx = {
    tokens: {
        admin: null,
        organizer: null,
        participant: null,
        judge: null
    },
    hackathonId: null,
    teamId: null,
    registrationId: null,
    submissionId: null,
    judgeId: null,
    reviewId: null,
    userId: null
};

function discoverRoutes() {
    const appJs = fs.readFileSync(APP_JS_PATH, 'utf-8');

    // Parse imports for routers
    const importRegex = /import\s+(?:{\s*([^}]+)\s*}|(\w+))\s+from\s+['"]\.\/routes\/([^'"]+)['"]/g;
    const routerToFile = {};
    const routerIsNamed = {};
    let match;
    while ((match = importRegex.exec(appJs)) !== null) {
        const file = match[3];
        if (match[2]) {
            routerToFile[match[2]] = file; // default import
            routerIsNamed[match[2]] = false;
        } else if (match[1]) {
            match[1].split(',').forEach(v => {
                const name = v.trim();
                routerToFile[name] = file;
                routerIsNamed[name] = true;
            });
        }
    }

    // Parse app.use mappings
    const useRegex = /app\.use\(['"]([^'"]+)['"],\s*(\w+)\)/g;
    const prefixes = [];
    while ((match = useRegex.exec(appJs)) !== null) {
        prefixes.push({ prefix: match[1], routerName: match[2] });
    }

    const allRoutes = [];
    // Add health route from app.js
    allRoutes.push({ method: 'GET', path: '/health', routerName: 'app' });

    for (const { prefix, routerName } of prefixes) {
        const fileName = routerToFile[routerName];
        if (!fileName) continue;

        const routePath = path.join(BACKEND_DIR, 'routes', fileName);
        if (!fs.existsSync(routePath)) continue;

        const routeContent = fs.readFileSync(routePath, 'utf-8');

        // If it's a named import, we strictly match the variable name (e.g. hackathonScopedRouter.post)
        // If it's default, we loosely match common default names (router, etc.)
        let regexStr;
        if (routerIsNamed[routerName]) {
            regexStr = `(?:${routerName})\\.(get|post|put|patch|delete)\\(\\s*['"]([^'"]+)['"]`;
        } else {
            regexStr = `(?:\\w*[R|r]outer|\\w*[R|r]outes)\\.(get|post|put|patch|delete)\\(\\s*['"]([^'"]+)['"]`;
        }

        const methodRegex = new RegExp(regexStr, 'g');
        let routeMatch;
        while ((routeMatch = methodRegex.exec(routeContent)) !== null) {
            const method = routeMatch[1].toUpperCase();
            const subPath = routeMatch[2];
            const fullPath = (prefix + (subPath === '/' ? '' : subPath)).replace(/\/+/g, '/');

            // avoid duplicates
            if (!allRoutes.some(r => r.method === method && r.path === fullPath)) {
                allRoutes.push({ method, path: fullPath, routerName });
            }
        }
    }
    return allRoutes;
}

function sortRoutes(routes) {
    const order = [
        { regex: /^\/api\/auth\/signup$/, method: 'POST' },
        { regex: /^\/api\/auth\/login$/, method: 'POST' },
        { regex: /^\/api\/auth\/me$/, method: 'GET' },
        { regex: /^\/api\/users$/, method: 'GET' },
        { regex: /^\/api\/hackathons$/, method: 'POST' },
        { regex: /^\/api\/hackathons\/.+\/open-registration$/, method: 'PATCH' },
        { regex: /^\/api\/teams$/, method: 'POST' },
        { regex: /^\/api\/hackathons\/.+\/register$/, method: 'POST' },
        { regex: /^\/api\/registrations\/.+\/approve$/, method: 'PATCH' },
        { regex: /^\/api\/hackathons\/.+\/submissions$/, method: 'POST' },
        { regex: /^\/api\/submissions\/.+\/status$/, method: 'PATCH' },
        { regex: /^\/api\/hackathons\/.+\/judges$/, method: 'POST' },
        { regex: /^\/api\/submissions\/.+\/reviews$/, method: 'POST' }
    ];

    return routes.sort((a, b) => {
        let indexA = order.findIndex(o => o.regex.test(a.path) && (o.method === 'ALL' || o.method === a.method));
        let indexB = order.findIndex(o => o.regex.test(b.path) && (o.method === 'ALL' || o.method === b.method));

        // Regular routes go in the middle
        if (indexA === -1) indexA = 500;
        if (indexB === -1) indexB = 500;

        // Ensure DELETEs and logout are strictly at the end
        if (a.method === 'DELETE') indexA = 998;
        if (b.method === 'DELETE') indexB = 998;
        if (a.path === '/api/auth/logout' && a.method === 'POST') indexA = 999;
        if (b.path === '/api/auth/logout' && b.method === 'POST') indexB = 999;

        return indexA - indexB;
    });
}

function buildRequest(method, urlPath) {
    const runId = Date.now();
    let finalUrl = urlPath;
    let body = undefined;
    let headers = {
        'Content-Type': 'application/json'
    };
    let token = ctx.tokens.participant;

    // Inject Path Params
    if (finalUrl.includes(':id')) {
        if (finalUrl.includes('/users')) finalUrl = finalUrl.replace(':id', ctx.userId || '64b64b64b64b64b64b64b64b');
        else if (finalUrl.includes('/teams')) finalUrl = finalUrl.replace(':id', ctx.teamId || '64b64b64b64b64b64b64b64b');
        else if (finalUrl.includes('/hackathons')) finalUrl = finalUrl.replace(':id', ctx.hackathonId || '64b64b64b64b64b64b64b64b');
        else if (finalUrl.includes('/submissions')) finalUrl = finalUrl.replace(':id', ctx.submissionId || '64b64b64b64b64b64b64b64b');
        else if (finalUrl.includes('/reviews')) finalUrl = finalUrl.replace(':id', ctx.reviewId || '64b64b64b64b64b64b64b64b');
        else finalUrl = finalUrl.replace(':id', '64b64b64b64b64b64b64b64b');
    }

    if (finalUrl.includes(':hackathonId')) finalUrl = finalUrl.replace(':hackathonId', ctx.hackathonId || '64b64b64b64b64b64b64b64b');
    if (finalUrl.includes(':teamId')) finalUrl = finalUrl.replace(':teamId', ctx.teamId || '64b64b64b64b64b64b64b64b');
    if (finalUrl.includes(':registrationId')) finalUrl = finalUrl.replace(':registrationId', ctx.registrationId || '64b64b64b64b64b64b64b64b');
    if (finalUrl.includes(':submissionId')) finalUrl = finalUrl.replace(':submissionId', ctx.submissionId || '64b64b64b64b64b64b64b64b');
    if (finalUrl.includes(':judgeId')) finalUrl = finalUrl.replace(':judgeId', ctx.judgeId || '64b64b64b64b64b64b64b64b');
    if (finalUrl.includes(':userId')) finalUrl = finalUrl.replace(':userId', ctx.userId || '64b64b64b64b64b64b64b64b');
    if (finalUrl.includes(':token')) finalUrl = finalUrl.replace(':token', 'dummy-reset-token');

    // Role Assignments based on routing patterns
    if (finalUrl.includes('/hackathons') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) token = ctx.tokens.organizer;
    if (finalUrl.includes('/registrations') && method === 'PATCH') token = ctx.tokens.organizer;
    if (finalUrl.includes('/submissions') && method === 'PATCH') token = ctx.tokens.organizer;
    if (finalUrl.includes('/judges') && method !== 'GET') token = ctx.tokens.organizer;
    if (finalUrl.includes('/reviews') && ['POST', 'PUT'].includes(method)) token = ctx.tokens.judge;
    if (finalUrl.includes('/admin') || finalUrl.includes('/users')) token = ctx.tokens.admin;

    // Body Generation
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (urlPath === '/api/auth/signup') {
            body = { name: 'Audit User', email: `audit.${runId}@example.com`, password: 'Password123' };
            token = null;
        } else if (urlPath === '/api/auth/login') {
            body = { email: ctx.adminEmail || `audit.${runId}@example.com`, password: 'Password123' };
            token = null;
        } else if (urlPath.includes('/teams') && !urlPath.includes('invite')) {
            body = { name: `Team ${runId}` };
        } else if (urlPath.includes('/hackathons') && !urlPath.includes('register') && !urlPath.includes('banner')) {
            const now = Date.now();
            const day = 24 * 60 * 60 * 1000;
            body = {
                title: `Audit Hackathon ${runId}`,
                description: 'Description long enough to pass the validator for audit.',
                theme: 'Audit',
                mode: 'online',
                registrationStartDate: new Date(now - day).toISOString(),
                registrationDeadline: new Date(now + day).toISOString(),
                startDate: new Date(now + 2 * day).toISOString(),
                submissionDeadline: new Date(now + 3 * day).toISOString(),
                endDate: new Date(now + 4 * day).toISOString(),
                prizePool: 1000,
                maxTeamSize: 4,
                rules: ['Rule 1'],
                judgingCriteria: [{ criterion: 'Test', maxMarks: 100 }]
            };
        } else if (urlPath.includes('/register') && method === 'POST') {
            body = { teamId: ctx.teamId };
        } else if (urlPath.includes('/submissions') && method === 'POST') {
            body = {
                projectName: `Audit Project ${runId}`,
                problemStatement: 'Problem',
                solutionDescription: 'Solution',
                githubRepo: 'https://github.com/test/repo',
                techStack: ['Node']
            };
        } else if (urlPath.includes('/status') && method === 'PATCH') {
            body = { status: 'approved' };
        } else if (urlPath.includes('/judges') && method === 'POST') {
            body = { judgeId: ctx.judgeId };
        } else if (urlPath.includes('/reviews') && method === 'POST') {
            body = { score: 85, comments: 'Good job' };
        } else {
            body = {};
        }
    }

    if (token) headers['Authorization'] = `Bearer ${token}`;

    return { finalUrl, body, headers };
}

async function seedContext() {
    console.log(color.cyan('\n[SYSTEM] Seeding initial context...'));

    async function register(role) {
        const user = { name: `${role} User`, email: `${role}.${Date.now()}@test.com`, password: 'Password123', role };
        try {
            const r = await fetch(`${BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            const data = await r.json();
            return { token: data?.data?.accessToken, id: data?.data?.user?.id || data?.data?.user?._id, email: user.email };
        } catch (e) {
            console.log(color.red(`Failed to seed ${role}: `) + e.message);
            return { token: null, id: null };
        }
    }

    const org = await register('organizer');
    ctx.tokens.organizer = org.token;

    const judge = await register('judge');
    ctx.tokens.judge = judge.token;
    ctx.judgeId = judge.id;

    const participant = await register('participant');
    ctx.tokens.participant = participant.token;
    ctx.userId = participant.id;

    const admin = await register('admin');
    ctx.tokens.admin = admin.token;
    ctx.adminEmail = admin.email;

    console.log(color.green('[SYSTEM] Context seeded successfully.\n'));
}

async function run() {
    console.log(color.cyan('Starting Repository Audit & Route Discovery...'));
    const discovered = discoverRoutes();
    const sortedRoutes = sortRoutes(discovered);
    console.log(color.cyan(`Discovered ${sortedRoutes.length} endpoints.`));

    await seedContext();

    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    const summary = {
        totalFound: discovered.length,
        totalTested: 0,
        skipped: 0,
        passed: 0,
        failed: 0,
        executionTimeMs: 0,
        failures: []
    };

    let idx = 1;
    for (const route of sortedRoutes) {
        const { method, path: routePath } = route;

        const { finalUrl, body, headers } = buildRequest(method, routePath);
        const start = Date.now();
        let status = 0, resHeadersStr = '', resBodyStr = '', errorStack = '', passed = false;

        try {
            const res = await fetch(`${BASE_URL}${finalUrl}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });

            status = res.status;
            resHeadersStr = JSON.stringify(Object.fromEntries(res.headers.entries()));
            const resText = await res.text();
            resBodyStr = resText;

            let resJson;
            try { resJson = JSON.parse(resText); } catch (e) { }

            // Extract dependencies for subsequent tests
            if (status >= 200 && status < 300 && resJson && resJson.data) {
                const data = resJson.data;
                const id = data._id || data.id;
                if (id) {
                    if (routePath === '/api/hackathons' && method === 'POST') ctx.hackathonId = id;
                    if (routePath === '/api/teams' && method === 'POST') ctx.teamId = id;
                    if (routePath.includes('/register') && method === 'POST') ctx.registrationId = id;
                    if (routePath.includes('/submissions') && method === 'POST') ctx.submissionId = id;
                    if (routePath.includes('/reviews') && method === 'POST') ctx.reviewId = id;
                }
            }

            // Server responds gracefully without crashing -> PASS (2xx, 3xx, 4xx)
            passed = status < 500;
        } catch (err) {
            errorStack = err.stack;
            passed = false;
        }

        const execTime = Date.now() - start;
        summary.executionTimeMs += execTime;
        summary.totalTested++;
        if (passed) summary.passed++;
        else {
            summary.failed++;
            summary.failures.push({ route: `${method} ${routePath}`, reason: status === 0 ? errorStack : `HTTP ${status}` });
        }

        const logStr = `==================================================
Timestamp: ${new Date().toISOString()}
HTTP Method: ${method}
Route: ${routePath}
Final URL: ${finalUrl}
Headers: ${JSON.stringify(headers, null, 2)}
Request Body: ${body ? JSON.stringify(body, null, 2) : 'None'}
Response Status: ${status}
Response Headers: ${resHeadersStr || 'None'}
Response Body: ${resBodyStr || 'None'}
Execution Time: ${execTime}ms
PASS/FAIL: ${passed ? 'PASS' : 'FAIL'}
Error Stack: ${errorStack || 'None'}
==================================================
`;

        const safePath = routePath.replace(/[^a-zA-Z0-9]/g, '_');
        fs.writeFileSync(path.join(logsDir, `${method}_${safePath}.log`), logStr);

        const dots = '.'.repeat(Math.max(1, 40 - routePath.length - method.length));
        console.log(`[${idx}/${sortedRoutes.length}] ${method} ${routePath} ${dots} ${passed ? color.green('PASS') : color.red('FAIL')}`);
        idx++;
    }

    fs.writeFileSync(path.join(logsDir, 'summary.json'), JSON.stringify(summary, null, 4));

    console.log(color.cyan('\n[SUMMARY]'));
    console.log(`Total Routes Found: ${summary.totalFound}`);
    console.log(`Total Tested: ${summary.totalTested}`);
    console.log(`Skipped: ${summary.skipped}`);
    console.log(color.green(`Passed: ${summary.passed}`));
    console.log(color.red(`Failed: ${summary.failed}`));
    console.log(`Execution Time: ${summary.executionTimeMs}ms`);

    if (summary.failures.length > 0) {
        console.log(color.red('\nFailures:'));
        summary.failures.forEach(f => console.log(`  - ${f.route}: ${f.reason}`));
    }
    console.log(`\nLogs generated in: ${logsDir}`);
}

run();
