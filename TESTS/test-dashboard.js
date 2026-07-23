import axios from 'axios';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123';
const color = {
    green: (s) => `[32m${s}[0m`,
    red: (s) => `[31m${s}[0m`,
    yellow: (s) => `[33m${s}[0m`,
    cyan: (s) => `[36m${s}[0m`,
    bold: (s) => `[1m${s}[0m`,
    gray: (s) => `[90m${s}[0m`,
};
let passCount = 0;
let failCount = 0;
const failedTests = [];
const runId = Date.now();
const orgUser = {
    name: 'Org Dash',
    email: `dash.org.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const judgeUser = {
    name: 'Judge Dash',
    email: `dash.j.${runId}@example.com`,
    password: 'Password123',
    role: 'judge',
};
const partUser = {
    name: 'Part Dash',
    email: `dash.p.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let orgToken, orgId, judgeToken, judgeId, partToken, partId, adminToken;
let hackathonId, teamId, regId, subId, reviewId;
let initialAdminData, initialOrgData, initialPartData, initialJudgeData;
const api = (path) => axios.create({ baseURL: `${BASE_URL}${path}`, validateStatus: () => true });
const authApi = api('/auth');
const hackApi = api('/hackathons');
const teamsApi = api('/teams');
const revApi = api('/submissions');
const dashApi = api('/dashboard');
function check(label, condition, details = '') {
    if (condition) {
        passCount++;
        console.log(`  ${color.green('PASS')}  ${label}`);
    } else {
        failCount++;
        failedTests.push(label);
        console.log(
            `  ${color.red('FAIL')}  ${label}${details ? color.gray(`  (${details})`) : ''}`
        );
    }
}
function section(title) {
    console.log(`\n${color.bold(color.cyan(title))}`);
}
function authHeader(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}
async function login(email, password) {
    const res = await authApi.post('/login', { email: email, password: password });
    return { token: res.data?.data?.accessToken || null, res: res };
}
async function signup(user) {
    const res = await authApi.post('/signup', user);
    return {
        token: res.data?.data?.accessToken || null,
        id: res.data?.data?.user?._id || res.data?.data?.user?.id || null,
        res: res,
    };
}
async function run() {
    console.log(color.bold(`\nRunning Dashboard API tests against ${color.yellow(BASE_URL)}\n`));
    section('Setup - Create Accounts');
    {
        orgToken = (await signup(orgUser)).token;
        const jRes = await signup(judgeUser);
        judgeToken = jRes.token;
        judgeId = jRes.id;
        partToken = (await signup(partUser)).token;
        if (ADMIN_EMAIL && ADMIN_PASSWORD) {
            adminToken = (await login(ADMIN_EMAIL, ADMIN_PASSWORD)).token;
        }
        check('Accounts created', !!orgToken && !!judgeToken && !!partToken);
    }
    section('1. Dashboard API Testing - Admin');
    {
        const noToken = await dashApi.get('/admin');
        check('Admin: No token → 401', noToken.status === 401);
        const orgReq = await dashApi.get('/admin', { headers: authHeader(orgToken) });
        check('Admin: Organizer token → 403', orgReq.status === 403);
        const partReq = await dashApi.get('/admin', { headers: authHeader(partToken) });
        check('Admin: Participant token → 403', partReq.status === 403);
        const judgeReq = await dashApi.get('/admin', { headers: authHeader(judgeToken) });
        check('Admin: Judge token → 403', judgeReq.status === 403);
        if (adminToken) {
            const adminReq = await dashApi.get('/admin', { headers: authHeader(adminToken) });
            check('Admin: Admin token → 200', adminReq.status === 200);
            initialAdminData = adminReq.data?.data;
        } else {
            console.log(`  ${color.yellow('SKIP')}  Admin: Admin token → 200`);
        }
    }
    section('1. Dashboard API Testing - Organizer');
    {
        const noToken = await dashApi.get('/organizer');
        check('Organizer: No token → 401', noToken.status === 401);
        const partReq = await dashApi.get('/organizer', { headers: authHeader(partToken) });
        check('Organizer: Participant token → 403', partReq.status === 403);
        const judgeReq = await dashApi.get('/organizer', { headers: authHeader(judgeToken) });
        check('Organizer: Judge token → 403', judgeReq.status === 403);
        if (adminToken) {
            const adminReq = await dashApi.get('/organizer', { headers: authHeader(adminToken) });
            check('Organizer: Admin token → 403', adminReq.status === 403);
        }
        const orgReq = await dashApi.get('/organizer', { headers: authHeader(orgToken) });
        check('Organizer: Organizer token → 200', orgReq.status === 200);
        initialOrgData = orgReq.data?.data;
    }
    section('1. Dashboard API Testing - Participant');
    {
        const noToken = await dashApi.get('/participant');
        check('Participant: No token → 401', noToken.status === 401);
        const orgReq = await dashApi.get('/participant', { headers: authHeader(orgToken) });
        check('Participant: Organizer token → 403', orgReq.status === 403);
        const judgeReq = await dashApi.get('/participant', { headers: authHeader(judgeToken) });
        check('Participant: Judge token → 403', judgeReq.status === 403);
        if (adminToken) {
            const adminReq = await dashApi.get('/participant', { headers: authHeader(adminToken) });
            check('Participant: Admin token → 403', adminReq.status === 403);
        }
        const partReq = await dashApi.get('/participant', { headers: authHeader(partToken) });
        check('Participant: Participant token → 200', partReq.status === 200);
        initialPartData = partReq.data?.data;
    }
    section('1. Dashboard API Testing - Judge');
    {
        const noToken = await dashApi.get('/judge');
        check('Judge: No token → 401', noToken.status === 401);
        const orgReq = await dashApi.get('/judge', { headers: authHeader(orgToken) });
        check('Judge: Organizer token → 403', orgReq.status === 403);
        const partReq = await dashApi.get('/judge', { headers: authHeader(partToken) });
        check('Judge: Participant token → 403', partReq.status === 403);
        if (adminToken) {
            const adminReq = await dashApi.get('/judge', { headers: authHeader(adminToken) });
            check('Judge: Admin token → 403', adminReq.status === 403);
        }
        const judgeReq = await dashApi.get('/judge', { headers: authHeader(judgeToken) });
        check('Judge: Judge token → 200', judgeReq.status === 200);
        initialJudgeData = judgeReq.data?.data;
    }
    section('2. Verify Returned Data Structure (Edge Cases - Empty)');
    {
        if (initialAdminData) {
            check(
                'Admin data structure',
                'totalUsers' in initialAdminData &&
                    'totalHackathons' in initialAdminData &&
                    'totalTeams' in initialAdminData &&
                    'totalSubmissions' in initialAdminData
            );
        }
        check(
            'Organizer data structure',
            'myHackathons' in initialOrgData &&
                'totalRegistrations' in initialOrgData &&
                'totalSubmissions' in initialOrgData &&
                'winnersAnnounced' in initialOrgData
        );
        check(
            'Participant data structure',
            'registeredHackathons' in initialPartData &&
                Array.isArray(initialPartData.teams) &&
                Array.isArray(initialPartData.submissions) &&
                'resultsPublished' in initialPartData
        );
        check(
            'Judge data structure',
            'assignedHackathons' in initialJudgeData &&
                'assignedProjects' in initialJudgeData &&
                'completedReviews' in initialJudgeData &&
                'pendingReviews' in initialJudgeData
        );
        check('Organizer baseline is 0', initialOrgData?.myHackathons === 0);
        check('Participant baseline is 0', initialPartData?.registeredHackathons === 0);
        check('Judge baseline is 0', initialJudgeData?.assignedHackathons === 0);
    }
    section('4. Integration Testing (Operations & Data Updates)');
    {
        const now = Date.now();
        const payload = {
            title: `Dash Hackathon ${runId}`,
            description: 'A perfectly long description for this dash',
            theme: 'Test',
            mode: 'online',
            registrationStartDate: new Date(now - 864e5).toISOString(),
            registrationDeadline: new Date(now + 864e5).toISOString(),
            startDate: new Date(now + 864e5 * 2).toISOString(),
            submissionDeadline: new Date(now + 864e5 * 3).toISOString(),
            endDate: new Date(now + 864e5 * 4).toISOString(),
            prizePool: 1e3,
            maxTeamSize: 4,
            rules: ['Rule 1'],
            judgingCriteria: [{ criterion: 'Score', maxMarks: 100 }],
        };
        const hRes = await hackApi.post('/', payload, { headers: authHeader(orgToken) });
        hackathonId = hRes.data?.data?._id || hRes.data?.data?.id;
        await hackApi.patch(
            `/${hackathonId}/open-registration`,
            {},
            { headers: authHeader(orgToken) }
        );
        const orgAfterHack = (await dashApi.get('/organizer', { headers: authHeader(orgToken) }))
            .data?.data;
        check(
            'Create hackathon → Organizer dashboard updates',
            orgAfterHack.myHackathons === initialOrgData.myHackathons + 1
        );
        if (adminToken) {
            const admAfterHack = (await dashApi.get('/admin', { headers: authHeader(adminToken) }))
                .data?.data;
            check(
                'Create hackathon → Admin dashboard updates',
                admAfterHack.totalHackathons === initialAdminData.totalHackathons + 1
            );
        }
        const tRes = await teamsApi.post(
            '/',
            { name: `Dash Team ${runId}` },
            { headers: authHeader(partToken) }
        );
        teamId = tRes.data?.data?._id || tRes.data?.data?.id;
        const rRes = await hackApi.post(
            `/${hackathonId}/register`,
            { teamId: teamId },
            { headers: authHeader(partToken) }
        );
        regId = rRes.data?.data?._id || rRes.data?.data?.id;
        const partAfterReg = (await dashApi.get('/participant', { headers: authHeader(partToken) }))
            .data?.data;
        check(
            'Register team → Participant dashboard updates',
            partAfterReg.registeredHackathons === initialPartData.registeredHackathons + 1
        );
        await api('').patch(
            `/registrations/${regId}/approve`,
            {},
            { headers: authHeader(orgToken) }
        );
        const orgAfterReg = (await dashApi.get('/organizer', { headers: authHeader(orgToken) }))
            .data?.data;
        check(
            'Register team → Organizer dashboard updates',
            orgAfterReg.totalRegistrations === initialOrgData.totalRegistrations + 1
        );
        const sRes = await hackApi.post(
            `/${hackathonId}/submissions`,
            {
                projectName: `Dash Project ${runId}`,
                problemStatement: 'P',
                solutionDescription: 'S',
            },
            { headers: authHeader(partToken) }
        );
        subId = sRes.data?.data?._id || sRes.data?.data?.id;
        const partAfterSub = (await dashApi.get('/participant', { headers: authHeader(partToken) }))
            .data?.data;
        check(
            'Submit project → Participant dashboard updates',
            partAfterSub.submissions.length === initialPartData.submissions.length + 1
        );
        const orgAfterSub = (await dashApi.get('/organizer', { headers: authHeader(orgToken) }))
            .data?.data;
        check(
            'Submit project → Organizer dashboard updates',
            orgAfterSub.totalSubmissions === initialOrgData.totalSubmissions + 1
        );
        await hackApi.post(
            `/${hackathonId}/judges`,
            { judgeId: judgeId },
            { headers: authHeader(orgToken) }
        );
        const judgeAfterAssign = (await dashApi.get('/judge', { headers: authHeader(judgeToken) }))
            .data?.data;
        check(
            'Assign judge → Judge dashboard updates',
            judgeAfterAssign.assignedHackathons === initialJudgeData.assignedHackathons + 1 &&
                judgeAfterAssign.assignedProjects === initialJudgeData.assignedProjects + 1
        );
        await revApi.post(
            `/${subId}/reviews`,
            { scores: [{ criterion: 'Score', score: 90 }] },
            { headers: authHeader(judgeToken) }
        );
        const judgeAfterRev = (await dashApi.get('/judge', { headers: authHeader(judgeToken) }))
            .data?.data;
        check(
            'Submit review → Judge dashboard updates (completed reviews)',
            judgeAfterRev.completedReviews === initialJudgeData.completedReviews + 1
        );
        await hackApi.patch(
            `/${hackathonId}/publish-results`,
            {},
            { headers: authHeader(orgToken) }
        );
        const orgAfterPub = (await dashApi.get('/organizer', { headers: authHeader(orgToken) }))
            .data?.data;
        check(
            'Publish results → Organizer dashboard updates',
            orgAfterPub.winnersAnnounced === initialOrgData.winnersAnnounced + 1
        );
        const partAfterPub = (await dashApi.get('/participant', { headers: authHeader(partToken) }))
            .data?.data;
        check(
            'Publish results → Participant dashboard updates',
            partAfterPub.resultsPublished === initialPartData.resultsPublished + 1
        );
    }
    console.log(`\n${color.bold('Summary')}`);
    console.log(
        `  ${color.green(`${passCount} passed`)}, ${failCount > 0 ? color.red(`${failCount} failed`) : `${failCount} failed`}`
    );
    if (failCount > 0) {
        console.log(`\n${color.red(color.bold('Failed tests:'))}`);
        failedTests.forEach((t) => console.log(`  - ${t}`));
        process.exitCode = 1;
    } else {
        console.log(color.green('\nAll tests passed'));
    }
}
run().catch(console.error);
