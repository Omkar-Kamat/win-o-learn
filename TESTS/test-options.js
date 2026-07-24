import axios from 'axios';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';
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
let orgToken, partToken;
let h1Id, h2Id, h3Id;
let t1Id, t2Id;
let s1Id, s2Id;
const api = (path) => axios.create({ baseURL: `${BASE_URL}${path}`, validateStatus: () => true });
const authApi = api('/auth');
const hackApi = api('/hackathons');
const teamsApi = api('/teams');
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
async function signup(user) {
    const res = await authApi.post('/signup', user);
    return {
        token: (res.headers['set-cookie']?.find(c => c.startsWith('accessToken='))?.split(';')[0]?.split('=')[1]) || null,
        id: res.data?.data?.user?._id || res.data?.data?.user?.id || null,
        res: res,
    };
}
async function run() {
    console.log(
        color.bold(`\nRunning Search & Filter API tests against ${color.yellow(BASE_URL)}\n`)
    );
    section('Setup - Create Accounts');
    const org = {
        name: 'Org Search',
        email: `search.org.${runId}@example.com`,
        password: 'Password123',
        role: 'organizer',
    };
    const part = {
        name: 'Part Search',
        email: `search.p.${runId}@example.com`,
        password: 'Password123',
        role: 'participant',
    };
    orgToken = (await signup(org)).token;
    partToken = (await signup(part)).token;
    check('Accounts created', !!orgToken && !!partToken);
    section('Setup - Create Hackathons');
    const now = Date.now();
    const baseHack = {
        prizePool: 1e3,
        maxTeamSize: 4,
        rules: ['Rule 1'],
        judgingCriteria: [{ criterion: 'Score', maxMarks: 100 }],
    };
    const h1Res = await hackApi.post(
        '/',
        {
            ...baseHack,
            title: `AI Hackathon ${runId}`,
            theme: 'AI',
            description: 'This is a blockchain test run',
            mode: 'online',
            registrationStartDate: new Date(now + 864e5).toISOString(),
            registrationDeadline: new Date(now + 864e5 * 2).toISOString(),
            startDate: new Date(now + 864e5 * 3).toISOString(),
            submissionDeadline: new Date(now + 864e5 * 4).toISOString(),
            endDate: new Date(now + 864e5 * 5).toISOString(),
        },
        { headers: authHeader(orgToken) }
    );
    h1Id = h1Res.data?.data?._id || h1Res.data?.data?.id;
    await hackApi.patch(`/${h1Id}/open-registration`, {}, { headers: authHeader(orgToken) });
    const h2Res = await hackApi.post(
        '/',
        {
            ...baseHack,
            title: `Hack to the future ${runId}`,
            theme: 'Healthcare',
            description: 'Working on healthcare stuff',
            mode: 'offline',
            venue: 'London',
            registrationStartDate: new Date(now - 864e5 * 4).toISOString(),
            registrationDeadline: new Date(now - 864e5 * 3).toISOString(),
            startDate: new Date(now - 864e5 * 2).toISOString(),
            submissionDeadline: new Date(now + 864e5 * 2).toISOString(),
            endDate: new Date(now + 864e5 * 3).toISOString(),
        },
        { headers: authHeader(orgToken) }
    );
    h2Id = h2Res.data?.data?._id || h2Res.data?.data?.id;
    const h3Res = await hackApi.post(
        '/',
        {
            ...baseHack,
            title: `Random Event ${runId}`,
            theme: 'Other',
            description: 'Random desc long enough',
            mode: 'online',
            registrationStartDate: new Date(now - 864e5 * 5).toISOString(),
            registrationDeadline: new Date(now - 864e5 * 4).toISOString(),
            startDate: new Date(now - 864e5 * 3).toISOString(),
            submissionDeadline: new Date(now - 864e5 * 2).toISOString(),
            endDate: new Date(now - 864e5).toISOString(),
        },
        { headers: authHeader(orgToken) }
    );
    h3Id = h3Res.data?.data?._id || h3Res.data?.data?.id;
    check('Hackathons created', !!h1Id && !!h2Id && !!h3Id);
    section('Setup - Create Teams & Submissions');
    const t1Res = await teamsApi.post(
        '/',
        { name: `Code Masters ${runId}` },
        { headers: authHeader(partToken) }
    );
    t1Id = t1Res.data?.data?._id || t1Res.data?.data?.id;
    const t2Res = await teamsApi.post(
        '/',
        { name: `Different Team ${runId}` },
        { headers: authHeader(partToken) }
    );
    t2Id = t2Res.data?.data?._id || t2Res.data?.data?.id;
    const r1Res = await hackApi.post(
        `/${h1Id}/register`,
        { teamId: t1Id },
        { headers: authHeader(partToken) }
    );
    const reg1Id = r1Res.data?.data?._id || r1Res.data?.data?.id;
    await api('').patch(`/registrations/${reg1Id}/approve`, {}, { headers: authHeader(orgToken) });
    const s1Res = await hackApi.post(
        `/${h1Id}/submissions`,
        {
            projectName: `Awesome Chatbot ${runId}`,
            problemStatement: 'P',
            solutionDescription: 'S',
        },
        { headers: authHeader(partToken) }
    );
    s1Id = s1Res.data?.data?._id || s1Res.data?.data?.id;
    check('Teams & Submissions created', !!t1Id && !!s1Id);
    section('Hackathon Search & Filter (14 Tests)');
    const hRes1 = await hackApi.get(`/`);
    const allHackathons = hRes1.data?.data?.hackathons || [];
    const r1 = await hackApi.get(`/?search=hack`);
    check(
        '1. Search by title',
        r1.data?.data?.hackathons?.some((h) => h.title.toLowerCase().includes('hack'))
    );
    const r2 = await hackApi.get(`/?search=ai`);
    check(
        '2. Search by theme',
        r2.data?.data?.hackathons?.some((h) => h.theme.toLowerCase() === 'ai')
    );
    const r3 = await hackApi.get(`/?search=blockchain`);
    check(
        '3. Search by description',
        r3.data?.data?.hackathons?.some((h) => h.description.toLowerCase().includes('blockchain'))
    );
    const r4 = await hackApi.get(`/?search=AI`);
    check(
        '4. Search is case-insensitive',
        r4.data?.data?.hackathons?.length === r2.data?.data?.hackathons?.length
    );
    const r5 = await hackApi.get(`/?mode=online`);
    check(
        '5. Filter online hackathons',
        r5.data?.data?.hackathons?.every((h) => h.mode === 'online') &&
            r5.data?.data?.hackathons?.length > 0
    );
    const r6 = await hackApi.get(`/?mode=offline`);
    check(
        '6. Filter offline hackathons',
        r6.data?.data?.hackathons?.every((h) => h.mode === 'offline') &&
            r6.data?.data?.hackathons?.length > 0
    );
    const r7 = await hackApi.get(`/?theme=Healthcare`);
    check(
        '7. Filter by theme',
        r7.data?.data?.hackathons?.every((h) => h.theme === 'Healthcare') &&
            r7.data?.data?.hackathons?.length > 0
    );
    const r8 = await hackApi.get(`/?registrationOpen=true`);
    check(
        '8. Registration open',
        r8.data?.data?.hackathons?.every((h) => h.registrationOpen === true) &&
            r8.data?.data?.hackathons?.length > 0
    );
    const r9 = await hackApi.get(`/?registrationOpen=false`);
    check(
        '9. Registration closed',
        r9.data?.data?.hackathons?.every((h) => h.registrationOpen === false) &&
            r9.data?.data?.hackathons?.length > 0
    );
    const r10 = await hackApi.get(`/?status=upcoming`);
    check(
        '10. Upcoming',
        r10.data?.data?.hackathons?.some((h) => h._id === h1Id)
    );
    const r11 = await hackApi.get(`/?status=ongoing`);
    check(
        '11. Ongoing',
        r11.data?.data?.hackathons?.some((h) => h._id === h2Id)
    );
    const r12 = await hackApi.get(`/?status=completed`);
    check(
        '12. Completed',
        r12.data?.data?.hackathons?.some((h) => h._id === h3Id)
    );
    const r13 = await hackApi.get(`/?search=ai&mode=online`);
    check(
        '13. Search + Mode',
        r13.data?.data?.hackathons?.every(
            (h) =>
                h.mode === 'online' &&
                (h.title.toLowerCase().includes('ai') ||
                    h.theme.toLowerCase().includes('ai') ||
                    h.description.toLowerCase().includes('ai'))
        )
    );
    const r14 = await hackApi.get(`/?search=hack&theme=Healthcare&status=ongoing`);
    check(
        '14. Search + Theme + Status',
        r14.data?.data?.hackathons?.some((h) => h._id === h2Id) &&
            r14.data?.data?.hackathons?.every((h) => h.theme === 'Healthcare')
    );
    section('Team Search (3 Tests)');
    const r15 = await teamsApi.get(`/?search=code`, { headers: authHeader(partToken) });
    check(
        '15. Search existing team',
        r15.data?.data?.teams?.some((t) => t.name.toLowerCase().includes('code'))
    );
    const r16 = await teamsApi.get(`/?search=CODE`, { headers: authHeader(partToken) });
    check(
        '16. Case-insensitive search',
        r16.data?.data?.teams?.length === r15.data?.data?.teams?.length
    );
    const r17 = await teamsApi.get(`/?search=randomxyz12399`, { headers: authHeader(partToken) });
    check(
        '17. No matching team',
        Array.isArray(r17.data?.data?.teams) && r17.data?.data?.teams?.length === 0
    );
    section('Submission Search (3 Tests)');
    const r18 = await subApi.get(`/?search=chatbot`, { headers: authHeader(partToken) });
    check(
        '18. Search project name',
        r18.data?.data?.submissions?.some((s) => s.projectName.toLowerCase().includes('chatbot'))
    );
    const r19 = await subApi.get(`/?search=CHATBOT`, { headers: authHeader(partToken) });
    check(
        '19. Case-insensitive search',
        r19.data?.data?.submissions?.length === r18.data?.data?.submissions?.length
    );
    const r20 = await subApi.get(`/?search=abcdef9999`, { headers: authHeader(partToken) });
    check(
        '20. No matching project',
        Array.isArray(r20.data?.data?.submissions) && r20.data?.data?.submissions?.length === 0
    );
    section('Edge Cases (5 Tests)');
    const r21 = await hackApi.get(`/?search=`);
    check('21. Empty search', r21.data?.data?.hackathons?.length === allHackathons.length);
    const r22 = await hackApi.get(`/?status=random`);
    check('22. Invalid status', r22.status === 400);
    const r23 = await hackApi.get(`/?mode=random`);
    check('23. Invalid mode', r23.status === 400);
    const r24 = await teamsApi.get(`/?search=${runId}`, { headers: authHeader(partToken) });
    check('24. Multiple results', r24.data?.data?.teams?.length >= 2);
    const r25 = await hackApi.get(`/`);
    check('25. No query parameters', r25.data?.data?.hackathons?.length === allHackathons.length);
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
