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
const organizerA = {
    name: 'Judge Assign Org A',
    email: `judge.assign.orga.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const organizerB = {
    name: 'Judge Assign Org B',
    email: `judge.assign.orgb.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const judgeOne = {
    name: 'Judge One',
    email: `judge.one.${runId}@example.com`,
    password: 'Password123',
    role: 'judge',
};
const judgeTwo = {
    name: 'Judge Two',
    email: `judge.two.${runId}@example.com`,
    password: 'Password123',
    role: 'judge',
};
const participantUser = {
    name: 'Participant User',
    email: `judge.participant.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let organizerAToken = null;
let organizerBToken = null;
let judgeOneToken = null;
let judgeOneId = null;
let judgeTwoToken = null;
let judgeTwoId = null;
let participantToken = null;
let participantId = null;
let adminToken = null;
let hackathonId = null;
const authApi = axios.create({ baseURL: `${BASE_URL}/auth`, validateStatus: () => true });
const hackathonsApi = axios.create({
    baseURL: `${BASE_URL}/hackathons`,
    validateStatus: () => true,
});
const judgesApi = axios.create({ baseURL: `${BASE_URL}/judges`, validateStatus: () => true });
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
        user: res.data?.data?.user || null,
        res: res,
    };
}
function buildHackathonPayload(overrides = {}) {
    const day = 24 * 60 * 60 * 1e3;
    const now = Date.now();
    return {
        title: `Judge Assign Hackathon ${runId}`,
        description:
            'A hackathon created for testing judge assignment functionality, padding length.',
        theme: 'Automation',
        mode: 'online',
        registrationStartDate: new Date(now + 1 * day).toISOString(),
        registrationDeadline: new Date(now + 5 * day).toISOString(),
        startDate: new Date(now + 7 * day).toISOString(),
        submissionDeadline: new Date(now + 8 * day).toISOString(),
        endDate: new Date(now + 9 * day).toISOString(),
        prizePool: 1e3,
        maxTeamSize: 4,
        rules: ['Maximum 4 members', 'Original work only'],
        judgingCriteria: [
            { criterion: 'Innovation', maxMarks: 30 },
            { criterion: 'Execution', maxMarks: 20 },
        ],
        ...overrides,
    };
}
async function run() {
    console.log(
        color.bold(`\nRunning Judge Assignments API tests against ${color.yellow(BASE_URL)}\n`)
    );
    section('Setup - create test accounts');
    {
        const oA = await signup(organizerA);
        check('Organizer A signup succeeds', oA.res.status === 201, `got ${oA.res.status}`);
        organizerAToken = oA.token;
        const oB = await signup(organizerB);
        check('Organizer B signup succeeds', oB.res.status === 201, `got ${oB.res.status}`);
        organizerBToken = oB.token;
        const j1 = await signup(judgeOne);
        check('Judge One signup succeeds', j1.res.status === 201, `got ${j1.res.status}`);
        judgeOneToken = j1.token;
        judgeOneId = j1.user?._id || j1.user?.id;
        const j2 = await signup(judgeTwo);
        check('Judge Two signup succeeds', j2.res.status === 201, `got ${j2.res.status}`);
        judgeTwoToken = j2.token;
        judgeTwoId = j2.user?._id || j2.user?.id;
        const p = await signup(participantUser);
        check('Participant signup succeeds', p.res.status === 201, `got ${p.res.status}`);
        participantToken = p.token;
        participantId = p.user?._id || p.user?.id;
        if (ADMIN_EMAIL && ADMIN_PASSWORD) {
            const adminLogin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
            if (adminLogin.token) {
                adminToken = adminLogin.token;
                console.log(`  ${color.gray('Admin logged in')}`);
            }
        }
        const hackRes = await hackathonsApi.post('/', buildHackathonPayload(), {
            headers: authHeader(organizerAToken),
        });
        check('Hackathon creation succeeds (201)', hackRes.status === 201, `got ${hackRes.status}`);
        hackathonId = hackRes.data?.data?._id || hackRes.data?.data?.id;
    }
    section('1. POST /hackathons/:hackathonId/judges');
    {
        const noToken = await hackathonsApi.post(`/${hackathonId}/judges`, { judgeId: judgeOneId });
        check('Rejects with no token (401)', noToken.status === 401, `got ${noToken.status}`);
        const wrongRole = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: judgeOneId },
            { headers: authHeader(judgeOneToken) }
        );
        check(
            'Rejects wrong role (judge trying to assign) (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const invalidHackathonId = await hackathonsApi.post(
            `/invalid-hackathon-id/judges`,
            { judgeId: judgeOneId },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects invalid hackathonId (400)',
            invalidHackathonId.status === 400,
            `got ${invalidHackathonId.status}`
        );
        const invalidJudgeId = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: 'invalid-judge-id' },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects invalid judgeId (400)',
            invalidJudgeId.status === 400,
            `got ${invalidJudgeId.status}`
        );
        const missingJudgeId = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects missing judgeId (400)',
            missingJudgeId.status === 400,
            `got ${missingJudgeId.status}`
        );
        const nonexistentJudge = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: '64b64b64b64b64b64b64b64b' },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects nonexistent judge (404)',
            nonexistentJudge.status === 404,
            `got ${nonexistentJudge.status}`
        );
        const participantInstead = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: participantId },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects participant instead of judge',
            [400, 403, 404].includes(participantInstead.status),
            `got ${participantInstead.status}`
        );
        const notOwner = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: judgeOneId },
            { headers: authHeader(organizerBToken) }
        );
        check(
            'Rejects non-owner organizer (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const assignSuccess = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: judgeOneId },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Assign judge successfully (200/201)',
            [200, 201].includes(assignSuccess.status),
            `got ${assignSuccess.status}`
        );
        const duplicateAssignment = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: judgeOneId },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects duplicate assignment (400/409)',
            [400, 409].includes(duplicateAssignment.status),
            `got ${duplicateAssignment.status}`
        );
        await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: judgeTwoId },
            { headers: authHeader(organizerAToken) }
        );
    }
    section('2. GET /hackathons/:hackathonId/judges');
    {
        const ownerList = await hackathonsApi.get(`/${hackathonId}/judges`, {
            headers: authHeader(organizerAToken),
        });
        check('Owner can list judges (200)', ownerList.status === 200, `got ${ownerList.status}`);
        const judgesArray = ownerList.data?.data?.judges || ownerList.data?.data || [];
        const hasJudgeOne = judgesArray.some(
            (j) => (j.judge?._id || j.judge?.id || j._id || j.id || j) === judgeOneId
        );
        check('List includes the assigned judges', hasJudgeOne);
        if (adminToken) {
            const adminList = await hackathonsApi.get(`/${hackathonId}/judges`, {
                headers: authHeader(adminToken),
            });
            check(
                'Admin can list judges (200)',
                adminList.status === 200,
                `got ${adminList.status}`
            );
        } else {
            console.log(`  ${color.yellow('SKIP')}  Admin list judges (no admin token)`);
        }
        const nonOwnerList = await hackathonsApi.get(`/${hackathonId}/judges`, {
            headers: authHeader(organizerBToken),
        });
        check(
            'Non-owner listing behavior (200 or 403)',
            [200, 403].includes(nonOwnerList.status),
            `got ${nonOwnerList.status}`
        );
        const invalidIds = await hackathonsApi.get('/invalid-hackathon-id/judges', {
            headers: authHeader(organizerAToken),
        });
        check(
            'Rejects invalid hackathonId (400)',
            invalidIds.status === 400,
            `got ${invalidIds.status}`
        );
    }
    section('3. DELETE /hackathons/:hackathonId/judges/:judgeId');
    {
        const notOwner = await hackathonsApi.delete(`/${hackathonId}/judges/${judgeOneId}`, {
            headers: authHeader(organizerBToken),
        });
        check(
            'Rejects non-owner organizer (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const successRemove = await hackathonsApi.delete(`/${hackathonId}/judges/${judgeOneId}`, {
            headers: authHeader(organizerAToken),
        });
        check(
            'Successfully removed judge (200)',
            successRemove.status === 200,
            `got ${successRemove.status}`
        );
        const alreadyRemoved = await hackathonsApi.delete(`/${hackathonId}/judges/${judgeOneId}`, {
            headers: authHeader(organizerAToken),
        });
        check(
            'Rejects already removed judge (400/404)',
            [400, 404].includes(alreadyRemoved.status),
            `got ${alreadyRemoved.status}`
        );
        const invalidIds = await hackathonsApi.delete(
            `/invalid-hackathon-id/judges/invalid-judge-id`,
            { headers: authHeader(organizerAToken) }
        );
        check('Invalid ids handled (400)', invalidIds.status === 400, `got ${invalidIds.status}`);
    }
    section('4. GET /judges/me/assigned-hackathons');
    {
        const assignedList = await judgesApi.get('/me/assigned-hackathons', {
            headers: authHeader(judgeTwoToken),
        });
        check(
            'Assigned judge can list their hackathons (200)',
            assignedList.status === 200,
            `got ${assignedList.status}`
        );
        const hackathonsArray =
            assignedList.data?.data?.hackathons || assignedList.data?.data || [];
        const includesHackathon = hackathonsArray.some(
            (h) => (h.hackathon?._id || h.hackathon?.id || h._id || h.id || h) === hackathonId
        );
        check('List includes the assigned hackathon', includesHackathon);
        const emptyList = await judgesApi.get('/me/assigned-hackathons', {
            headers: authHeader(judgeOneToken),
        });
        check(
            'Removed judge has empty or excluded hackathon list',
            emptyList.status === 200,
            `got ${emptyList.status}`
        );
        const emptyHackathonsArray = emptyList.data?.data?.hackathons || emptyList.data?.data || [];
        const excludesHackathon = !emptyHackathonsArray.some(
            (h) => (h.hackathon?._id || h.hackathon?.id || h._id || h.id || h) === hackathonId
        );
        check('List does not include the removed hackathon', excludesHackathon);
        const wrongRole = await judgesApi.get('/me/assigned-hackathons', {
            headers: authHeader(participantToken),
        });
        check(
            'Wrong role (participant) rejected (401/403)',
            [401, 403].includes(wrongRole.status),
            `got ${wrongRole.status}`
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
run().catch((err) => {
    console.error(color.red(`\nTest runner crashed: ${err.message}`));
    console.error(color.gray('Is the server running and is BASE_URL correct?'));
    process.exitCode = 1;
});
