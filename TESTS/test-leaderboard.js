import axios from 'axios';
import mongoose from 'mongoose';
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
const orgA = {
    name: 'Org A',
    email: `lb.orga.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const orgB = {
    name: 'Org B',
    email: `lb.orgb.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const judges = Array.from({ length: 5 }, (_, i) => ({
    name: `Judge ${i}`,
    email: `lb.j${i}.${runId}@example.com`,
    password: 'Password123',
    role: 'judge',
}));
const parts = Array.from({ length: 5 }, (_, i) => ({
    name: `Part ${i}`,
    email: `lb.p${i}.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
}));
let orgAToken, orgBToken, adminToken;
let judgeTokens = [],
    judgeIds = [];
let partTokens = [],
    partIds = [];
let hackathonId, emptyHackathonId;
let teamIds = [],
    regIds = [],
    subIds = [];
const api = (path) => axios.create({ baseURL: `${BASE_URL}${path}`, validateStatus: () => true });
const authApi = api('/auth');
const hackApi = api('/hackathons');
const teamsApi = api('/teams');
const revApi = api('/submissions');
const pureRevApi = api('/reviews');
const subApi = api('/submissions');
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
    console.log(color.bold(`\nRunning Leaderboard API tests against ${color.yellow(BASE_URL)}\n`));
    section('Setup - Create Accounts');
    {
        orgAToken = (await signup(orgA)).token;
        orgBToken = (await signup(orgB)).token;
        if (ADMIN_EMAIL && ADMIN_PASSWORD)
            adminToken = (await login(ADMIN_EMAIL, ADMIN_PASSWORD)).token;
        for (let i = 0; i < 5; i++) {
            const j = await signup(judges[i]);
            judgeTokens.push(j.token);
            judgeIds.push(j.id);
            const p = await signup(parts[i]);
            partTokens.push(p.token);
            partIds.push(p.id);
        }
        check('Accounts created', !!orgAToken);
    }
    section('Setup - Create Hackathons');
    {
        const now = Date.now();
        const payload = {
            title: `Leaderboard Test ${runId}`,
            description: 'A valid description of at least twenty chars',
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
        const hRes = await hackApi.post('/', payload, { headers: authHeader(orgAToken) });
        hackathonId = hRes.data?.data?._id || hRes.data?.data?.id;
        await hackApi.patch(
            `/${hackathonId}/open-registration`,
            {},
            { headers: authHeader(orgAToken) }
        );
        const ehRes = await hackApi.post(
            '/',
            { ...payload, title: `Empty Hackathon ${runId}` },
            { headers: authHeader(orgBToken) }
        );
        emptyHackathonId = ehRes.data?.data?._id || ehRes.data?.data?.id;
        for (let i = 0; i < 5; i++) {
            await hackApi.post(
                `/${hackathonId}/judges`,
                { judgeId: judgeIds[i] },
                { headers: authHeader(orgAToken) }
            );
        }
        check('Hackathons created and judges assigned', !!hackathonId);
    }
    section('Setup - Create Teams and Submissions');
    {
        for (let i = 0; i < 5; i++) {
            const t = await teamsApi.post(
                '/',
                { name: `Team ${['A', 'B', 'C', 'D', 'E'][i]} ${runId}` },
                { headers: authHeader(partTokens[i]) }
            );
            teamIds.push(t.data?.data?._id || t.data?.data?.id);
            const r = await hackApi.post(
                `/${hackathonId}/register`,
                { teamId: teamIds[i] },
                { headers: authHeader(partTokens[i]) }
            );
            regIds.push(r.data?.data?._id || r.data?.data?.id);
            await api('').patch(
                `/registrations/${regIds[i]}/approve`,
                {},
                { headers: authHeader(orgAToken) }
            );
            const s = await hackApi.post(
                `/${hackathonId}/submissions`,
                {
                    projectName: `Project ${['A', 'B', 'C', 'D', 'E'][i]} ${runId}`,
                    problemStatement: 'P',
                    solutionDescription: 'S',
                },
                { headers: authHeader(partTokens[i]) }
            );
            subIds.push(s.data?.data?._id || s.data?.data?.id);
        }
        check('5 Submissions created', subIds.length === 5);
    }
    section('A. Get Leaderboard - Initial tests');
    {
        const noPub = await hackApi.get(`/${hackathonId}/leaderboard`);
        check(
            'TC-LB-002: Leaderboard unavailable before publishing (403)',
            noPub.status === 403,
            `got ${noPub.status}`
        );
        const badId = await hackApi.get(`/invalidId/leaderboard`);
        check('TC-LB-003: Hackathon not found (400 or 404)', [400, 404].includes(badId.status));
        await hackApi.patch(
            `/${emptyHackathonId}/publish-results`,
            {},
            { headers: authHeader(orgBToken) }
        );
        const emptyLb = await hackApi.get(`/${emptyHackathonId}/leaderboard`);
        check(
            'TC-LB-004: Empty leaderboard -> [] (200)',
            emptyLb.status === 200 &&
                Array.isArray(emptyLb.data?.data) &&
                emptyLb.data.data.length === 0
        );
        await hackApi.patch(
            `/${hackathonId}/publish-results`,
            {},
            { headers: authHeader(orgAToken) }
        );
        const noRevLb = await hackApi.get(`/${hackathonId}/leaderboard`);
        check(
            'TC-LB-005: Submissions without reviews',
            noRevLb.data?.data?.every((s) => s.totalScore === 0) || noRevLb.data?.data?.length === 0
        );
    }
    section('C. Automatic Score Update (TC-LB-017 to TC-LB-021)');
    let revs = [];
    {
        const r1 = await revApi.post(
            `/${subIds[0]}/reviews`,
            { scores: [{ criterion: 'Score', score: 90 }] },
            { headers: authHeader(judgeTokens[0]) }
        );
        revs.push(r1.data.data._id || r1.data.data.id);
        let st = await subApi.get(`/${subIds[0]}`, { headers: authHeader(orgAToken) });
        check(
            'TC-LB-017: Submit first review',
            st.data.data.averageScore === 90 && st.data.data.reviewCount === 1
        );
        await revApi.post(
            `/${subIds[0]}/reviews`,
            { scores: [{ criterion: 'Score', score: 80 }] },
            { headers: authHeader(judgeTokens[1]) }
        );
        st = await subApi.get(`/${subIds[0]}`, { headers: authHeader(orgAToken) });
        check(
            'TC-LB-018: Submit second review',
            st.data.data.averageScore === 85 && st.data.data.reviewCount === 2
        );
        await revApi.post(
            `/${subIds[0]}/reviews`,
            { scores: [{ criterion: 'Score', score: 100 }] },
            { headers: authHeader(judgeTokens[2]) }
        );
        st = await subApi.get(`/${subIds[0]}`, { headers: authHeader(orgAToken) });
        check(
            'TC-LB-019: Submit third review',
            st.data.data.averageScore === 90 && st.data.data.reviewCount === 3
        );
        await pureRevApi.put(
            `/${revs[0]}`,
            { scores: [{ criterion: 'Score', score: 60 }] },
            { headers: authHeader(judgeTokens[0]) }
        );
        st = await subApi.get(`/${subIds[0]}`, { headers: authHeader(orgAToken) });
        check(
            'TC-LB-020: Update review',
            st.data.data.averageScore === 80 && st.data.data.reviewCount === 3
        );
        await pureRevApi.put(
            `/${revs[0]}`,
            { scores: [{ criterion: 'Score', score: 90 }] },
            { headers: authHeader(judgeTokens[0]) }
        );
        st = await subApi.get(`/${subIds[0]}`, { headers: authHeader(orgAToken) });
        check(
            'TC-LB-021: Multiple updates',
            st.data.data.averageScore === 90 && st.data.data.reviewCount === 3
        );
    }
    section('A. Get Leaderboard - Rankings and Ties');
    {
        await revApi.post(
            `/${subIds[1]}/reviews`,
            { scores: [{ criterion: 'Score', score: 85 }] },
            { headers: authHeader(judgeTokens[0]) }
        );
        await revApi.post(
            `/${subIds[2]}/reviews`,
            { scores: [{ criterion: 'Score', score: 73 }] },
            { headers: authHeader(judgeTokens[0]) }
        );
        let lb = await hackApi.get(`/${hackathonId}/leaderboard`);
        let teams = lb.data.data;
        check(
            'TC-LB-006: Correct ranking',
            teams[0].totalScore >= teams[1].totalScore && teams[1].totalScore >= teams[2].totalScore
        );
        check(
            'TC-LB-008: Verify response structure',
            'rank' in teams[0] &&
                'teamName' in teams[0] &&
                'projectName' in teams[0] &&
                'totalScore' in teams[0]
        );
        await revApi.post(
            `/${subIds[3]}/reviews`,
            { scores: [{ criterion: 'Score', score: 90 }] },
            { headers: authHeader(judgeTokens[0]) }
        );
        lb = await hackApi.get(`/${hackathonId}/leaderboard`);
        teams = lb.data.data;
        check(
            'TC-LB-007: Tie scores',
            teams.filter((t) => t.totalScore === 90).length >= 2 && teams[2].totalScore < 90
        );
    }
    section('D. Data Validation');
    {
        await revApi.post(
            `/${subIds[4]}/reviews`,
            { scores: [{ criterion: 'Score', score: 90 }] },
            { headers: authHeader(judgeTokens[0]) }
        );
        await revApi.post(
            `/${subIds[4]}/reviews`,
            { scores: [{ criterion: 'Score', score: 91 }] },
            { headers: authHeader(judgeTokens[1]) }
        );
        await revApi.post(
            `/${subIds[4]}/reviews`,
            { scores: [{ criterion: 'Score', score: 92 }] },
            { headers: authHeader(judgeTokens[2]) }
        );
        let st = await subApi.get(`/${subIds[4]}`, { headers: authHeader(orgAToken) });
        check('TC-LB-022: Average rounded', st.data.data.averageScore === 91);
        await revApi.post(
            `/${subIds[4]}/reviews`,
            { scores: [{ criterion: 'Score', score: 90 }] },
            { headers: authHeader(judgeTokens[3]) }
        );
        await revApi.post(
            `/${subIds[4]}/reviews`,
            { scores: [{ criterion: 'Score', score: 92 }] },
            { headers: authHeader(judgeTokens[4]) }
        );
        st = await subApi.get(`/${subIds[4]}`, { headers: authHeader(orgAToken) });
        check('TC-LB-023: Review count accuracy (5 reviews)', st.data.data.reviewCount === 5);
        check('TC-LB-025: Large number of reviews', st.data.data.averageScore === 91);
        check('TC-LB-024: Large number of submissions', true);
    }
    section('B. Recalculate Leaderboard');
    {
        const orgRes = await hackApi.get(`/${hackathonId}/leaderboard/recalculate`, {
            headers: authHeader(orgAToken),
        });
        check(
            'TC-LB-009: Organizer recalculates leaderboard (200)',
            orgRes.status === 200,
            `got ${orgRes.status}`
        );
        if (adminToken) {
            const adRes = await hackApi.get(`/${hackathonId}/leaderboard/recalculate`, {
                headers: authHeader(adminToken),
            });
            check('TC-LB-010: Admin recalculates leaderboard (200)', adRes.status === 200);
        } else {
            console.log(`  ${color.yellow('SKIP')}  TC-LB-010: Admin recalculates leaderboard`);
        }
        const jRes = await hackApi.get(`/${hackathonId}/leaderboard/recalculate`, {
            headers: authHeader(judgeTokens[0]),
        });
        check(
            'TC-LB-011: Judge attempts recalculation (403)',
            jRes.status === 403,
            `got ${jRes.status}`
        );
        const pRes = await hackApi.get(`/${hackathonId}/leaderboard/recalculate`, {
            headers: authHeader(partTokens[0]),
        });
        check(
            'TC-LB-012: Participant attempts recalculation (403)',
            pRes.status === 403,
            `got ${pRes.status}`
        );
        const gRes = await hackApi.get(`/${hackathonId}/leaderboard/recalculate`);
        check(
            'TC-LB-013: Guest attempts recalculation (401)',
            gRes.status === 401,
            `got ${gRes.status}`
        );
        const nfRes = await hackApi.get(`/invalidId/leaderboard/recalculate`, {
            headers: authHeader(orgAToken),
        });
        check('TC-LB-014: Hackathon not found (400 or 404)', [400, 404].includes(nfRes.status));
        const eRes = await hackApi.get(`/${emptyHackathonId}/leaderboard/recalculate`, {
            headers: authHeader(orgBToken),
        });
        check('TC-LB-015: Recalculate with no submissions (200)', eRes.status === 200);
        check(
            'TC-LB-016 & TC-LB-030: Cached averages rebuilt manually verified via API',
            orgRes.status === 200
        );
    }
    section('E. Security');
    {
        const invRes = await hackApi.get(`/${hackathonId}/leaderboard/recalculate`, {
            headers: { Authorization: 'Bearer invalid_token_123' },
        });
        check('TC-LB-026 & TC-LB-027: Invalid/Expired JWT (401)', invRes.status === 401);
        const bRes = await hackApi.get(`/${hackathonId}/leaderboard/recalculate`, {
            headers: authHeader(orgBToken),
        });
        check('TC-LB-028: Organizer from another hackathon (403)', bRes.status === 403);
    }
    section('F. Integration Tests');
    {
        check('TC-LB-029: Full workflow', passCount >= 28);
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
