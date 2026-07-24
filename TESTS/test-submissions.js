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
const organizerA = {
    name: 'Submission Tester Organizer A',
    email: `sub.tester.organizer.a.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const organizerB = {
    name: 'Submission Tester Organizer B',
    email: `sub.tester.organizer.b.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const leader = {
    name: 'Submission Tester Leader',
    email: `sub.tester.leader.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const member = {
    name: 'Submission Tester Member',
    email: `sub.tester.member.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const outsider = {
    name: 'Submission Tester Outsider',
    email: `sub.tester.outsider.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const pendingLeader = {
    name: 'Submission Tester Pending Leader',
    email: `sub.tester.pending.leader.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let organizerAToken = null;
let organizerBToken = null;
let leaderToken = null;
let memberToken = null;
let memberId = null;
let outsiderToken = null;
let pendingLeaderToken = null;
let hackathonId = null;
let teamId = null;
let registrationId = null;
let pendingTeamId = null;
let submissionId = null;
const authApi = axios.create({ baseURL: `${BASE_URL}/auth`, validateStatus: () => true });
const usersApi = axios.create({ baseURL: `${BASE_URL}/users`, validateStatus: () => true });
const teamsApi = axios.create({ baseURL: `${BASE_URL}/teams`, validateStatus: () => true });
const hackathonsApi = axios.create({
    baseURL: `${BASE_URL}/hackathons`,
    validateStatus: () => true,
});
const submissionsApi = axios.create({
    baseURL: `${BASE_URL}/submissions`,
    validateStatus: () => true,
});
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
        id: res.data?.data?.user?.id || res.data?.data?.user?._id || null,
        res: res,
    };
}
async function run() {
    console.log(color.bold(`\nRunning Submission API tests against ${color.yellow(BASE_URL)}\n`));
    section('Setup - create test accounts');
    {
        const a = await signup(organizerA);
        organizerAToken = a.token;
        check('Organizer A signup succeeds', a.res.status === 201, `got ${a.res.status}`);
        const b = await signup(organizerB);
        organizerBToken = b.token;
        check('Organizer B signup succeeds', b.res.status === 201, `got ${b.res.status}`);
        const l = await signup(leader);
        leaderToken = l.token;
        check('Leader signup succeeds', l.res.status === 201, `got ${l.res.status}`);
        const m = await signup(member);
        memberToken = m.token;
        memberId = m.id;
        check('Member signup succeeds', m.res.status === 201, `got ${m.res.status}`);
        const o = await signup(outsider);
        outsiderToken = o.token;
        check('Outsider signup succeeds', o.res.status === 201, `got ${o.res.status}`);
        const p = await signup(pendingLeader);
        pendingLeaderToken = p.token;
        check('Pending leader signup succeeds', p.res.status === 201, `got ${p.res.status}`);
    }
    section('Setup - create hackathon');
    {
        const now = Date.now();
        const res = await hackathonsApi.post(
            '/',
            {
                title: 'Submission Module Test Hackathon',
                description: 'A hackathon used only to exercise the submission routes.',
                theme: 'Testing',
                mode: 'online',
                registrationStartDate: new Date(now - 1e3 * 60 * 60).toISOString(),
                registrationDeadline: new Date(now + 1e3 * 60 * 60).toISOString(),
                startDate: new Date(now + 1e3 * 60 * 60 * 2).toISOString(),
                submissionDeadline: new Date(now + 1e3 * 60 * 60 * 12).toISOString(),
                endDate: new Date(now + 1e3 * 60 * 60 * 24).toISOString(),
                prizePool: 1e3,
                maxTeamSize: 4,
                rules: ['Original work only'],
                judgingCriteria: [{ criterion: 'Innovation', maxMarks: 50 }],
            },
            { headers: authHeader(organizerAToken) }
        );
        check('Hackathon created (201)', res.status === 201, `got ${res.status}`);
        hackathonId = res.data?.data?._id || res.data?.data?.id;
        check('Hackathon id captured', !!hackathonId);
        const openRes = await hackathonsApi.patch(
            `/${hackathonId}/open-registration`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check('Registration opened (200)', openRes.status === 200, `got ${openRes.status}`);
    }
    section('Setup - create and register the approved team');
    {
        const res = await teamsApi.post(
            '/',
            { name: 'Approved Submission Team', members: [memberId] },
            { headers: authHeader(leaderToken) }
        );
        check('Team created (201)', res.status === 201, `got ${res.status}`);
        teamId = res.data?.data?._id || res.data?.data?.id;
        check('Team id captured', !!teamId);
        const regRes = await hackathonsApi.post(
            `/${hackathonId}/register`,
            { teamId: teamId },
            { headers: authHeader(leaderToken) }
        );
        check('Team registered (201)', regRes.status === 201, `got ${regRes.status}`);
        registrationId = regRes.data?.data?._id || regRes.data?.data?.id;
        check('Registration id captured', !!registrationId);
        const approveRes = await hackathonsApi.get(`/${hackathonId}/registrations`, {
            headers: authHeader(organizerAToken),
        });
        check(
            'Organizer can list registrations (200)',
            approveRes.status === 200,
            `got ${approveRes.status}`
        );
        const doApprove = await axios.patch(
            `${BASE_URL}/registrations/${registrationId}/approve`,
            {},
            { headers: authHeader(organizerAToken), validateStatus: () => true }
        );
        check('Registration approved (200)', doApprove.status === 200, `got ${doApprove.status}`);
    }
    section('Setup - create a team with a pending registration');
    {
        const res = await teamsApi.post(
            '/',
            { name: 'Pending Submission Team' },
            { headers: authHeader(pendingLeaderToken) }
        );
        check('Pending team created (201)', res.status === 201, `got ${res.status}`);
        pendingTeamId = res.data?.data?._id || res.data?.data?.id;
        const regRes = await hackathonsApi.post(
            `/${hackathonId}/register`,
            { teamId: pendingTeamId },
            { headers: authHeader(pendingLeaderToken) }
        );
        check('Pending team registered (201)', regRes.status === 201, `got ${regRes.status}`);
    }
    section('1. POST /hackathons/:hackathonId/submissions - validation');
    {
        const noAuth = await hackathonsApi.post(`/${hackathonId}/submissions`, {});
        check('Rejects create with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const asOrganizer = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            { projectName: 'X', problemStatement: 'X', solutionDescription: 'X' },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects create from an organizer (403)',
            asOrganizer.status === 403,
            `got ${asOrganizer.status}`
        );
        const missingFields = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            {},
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects create with missing required fields (400)',
            missingFields.status === 400,
            `got ${missingFields.status}`
        );
        const badUrl = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            {
                projectName: 'Test Project',
                problemStatement: 'A problem worth solving',
                solutionDescription: 'A solution that solves it',
                githubRepo: 'not-a-url',
            },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects create with invalid githubRepo URL (400)',
            badUrl.status === 400,
            `got ${badUrl.status}`
        );
        const asNonLeaderMember = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            {
                projectName: 'Test Project',
                problemStatement: 'A problem worth solving',
                solutionDescription: 'A solution that solves it',
            },
            { headers: authHeader(memberToken) }
        );
        check(
            'Rejects create from a non-leader team member (403)',
            asNonLeaderMember.status === 403,
            `got ${asNonLeaderMember.status}`
        );
    }
    section('2. POST /hackathons/:hackathonId/submissions - unapproved team');
    {
        const res = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            {
                projectName: 'Pending Team Project',
                problemStatement: 'A problem worth solving',
                solutionDescription: 'A solution that solves it',
            },
            { headers: authHeader(pendingLeaderToken) }
        );
        check(
            'Rejects submission from a team whose registration is still pending (400)',
            res.status === 400,
            `got ${res.status}`
        );
    }
    section('3. POST /hackathons/:hackathonId/submissions - success');
    {
        const res = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            {
                projectName: 'Approved Team Project',
                problemStatement: 'A problem worth solving',
                solutionDescription: 'A working solution',
                githubRepo: 'https://github.com/example/repo',
                liveDemoUrl: 'https://example.com/demo',
                techStack: ['node', 'mongodb'],
            },
            { headers: authHeader(leaderToken) }
        );
        check('Create submission succeeds (201)', res.status === 201, `got ${res.status}`);
        submissionId = res.data?.data?._id || res.data?.data?.id;
        check('Submission id captured', !!submissionId);
        check('Submission status defaults to pending', res.data?.data?.status === 'pending');
        const duplicate = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            {
                projectName: 'Second Attempt',
                problemStatement: 'A problem worth solving',
                solutionDescription: 'A working solution',
            },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects a second submission for the same team (400)',
            duplicate.status === 400,
            `got ${duplicate.status}`
        );
    }
    section('4. GET /hackathons/:hackathonId/submissions/mine');
    {
        const noAuth = await hackathonsApi.get(`/${hackathonId}/submissions/mine`);
        check('Rejects request with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const asLeader = await hackathonsApi.get(`/${hackathonId}/submissions/mine`, {
            headers: authHeader(leaderToken),
        });
        check(
            'Leader can read their own submission (200)',
            asLeader.status === 200,
            `got ${asLeader.status}`
        );
        check(
            'Response has the right project name',
            asLeader.data?.data?.projectName === 'Approved Team Project'
        );
        const asMember = await hackathonsApi.get(`/${hackathonId}/submissions/mine`, {
            headers: authHeader(memberToken),
        });
        check(
            'Team member can also read the submission (200)',
            asMember.status === 200,
            `got ${asMember.status}`
        );
        const asOutsider = await hackathonsApi.get(`/${hackathonId}/submissions/mine`, {
            headers: authHeader(outsiderToken),
        });
        check(
            'Rejects a non-member reading their own submission scope (404)',
            asOutsider.status === 404,
            `got ${asOutsider.status}`
        );
    }
    section('5. GET /submissions/:id - access control');
    {
        const noAuth = await submissionsApi.get(`/${submissionId}`);
        check('Rejects request with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const asOutsider = await submissionsApi.get(`/${submissionId}`, {
            headers: authHeader(outsiderToken),
        });
        check(
            'Rejects an unrelated participant (403)',
            asOutsider.status === 403,
            `got ${asOutsider.status}`
        );
        const asMember = await submissionsApi.get(`/${submissionId}`, {
            headers: authHeader(memberToken),
        });
        check(
            'Team member can view the submission (200)',
            asMember.status === 200,
            `got ${asMember.status}`
        );
        const asOrganizerOwner = await submissionsApi.get(`/${submissionId}`, {
            headers: authHeader(organizerAToken),
        });
        check(
            'Owning organizer can view the submission (200)',
            asOrganizerOwner.status === 200,
            `got ${asOrganizerOwner.status}`
        );
        const badId = await submissionsApi.get('/not-a-valid-id', {
            headers: authHeader(leaderToken),
        });
        check(
            'Invalid submission id format is rejected (400)',
            badId.status === 400,
            `got ${badId.status}`
        );
    }
    section('6. PUT /submissions/:id - update');
    {
        const asNonLeader = await submissionsApi.put(
            `/${submissionId}`,
            { projectName: 'Renamed By Member' },
            { headers: authHeader(memberToken) }
        );
        check(
            'Rejects update from a non-leader team member (403)',
            asNonLeader.status === 403,
            `got ${asNonLeader.status}`
        );
        const res = await submissionsApi.put(
            `/${submissionId}`,
            { projectName: 'Updated Project Name', techStack: ['node', 'express', 'mongodb'] },
            { headers: authHeader(leaderToken) }
        );
        check('Leader can update the submission (200)', res.status === 200, `got ${res.status}`);
        check('Project name was updated', res.data?.data?.projectName === 'Updated Project Name');
        const statusTamper = await submissionsApi.put(
            `/${submissionId}`,
            { status: 'approved' },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects leader trying to set status directly through update (400)',
            statusTamper.status === 400,
            `got ${statusTamper.status}`
        );
    }
    section('7. PUT /submissions/:id/files - update files');
    {
        const asNonLeader = await submissionsApi.put(
            `/${submissionId}/files`,
            { presentation: 'https://example.com/slides.pdf' },
            { headers: authHeader(memberToken) }
        );
        check(
            'Rejects file update from a non-leader team member (403)',
            asNonLeader.status === 403,
            `got ${asNonLeader.status}`
        );
        const res = await submissionsApi.put(
            `/${submissionId}/files`,
            {
                presentation: 'https://example.com/slides.pdf',
                demoVideo: 'https://example.com/demo.mp4',
            },
            { headers: authHeader(leaderToken) }
        );
        check('Leader can update submission files (200)', res.status === 200, `got ${res.status}`);
        check(
            'Presentation url was saved',
            res.data?.data?.presentation === 'https://example.com/slides.pdf'
        );
        const statusTamper = await submissionsApi.put(
            `/${submissionId}/files`,
            { status: 'approved' },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects leader trying to set status through the files route (400)',
            statusTamper.status === 400,
            `got ${statusTamper.status}`
        );
    }
    section('8. PATCH /submissions/:id/status');
    {
        const asParticipant = await submissionsApi.patch(
            `/${submissionId}/status`,
            { status: 'approved' },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects status change from a participant (403)',
            asParticipant.status === 403,
            `got ${asParticipant.status}`
        );
        const asNonOwningOrganizer = await submissionsApi.patch(
            `/${submissionId}/status`,
            { status: 'approved' },
            { headers: authHeader(organizerBToken) }
        );
        check(
            'Rejects status change from a non-owning organizer (403)',
            asNonOwningOrganizer.status === 403,
            `got ${asNonOwningOrganizer.status}`
        );
        const invalidStatus = await submissionsApi.patch(
            `/${submissionId}/status`,
            { status: 'not-a-real-status' },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects an invalid status value (400)',
            invalidStatus.status === 400,
            `got ${invalidStatus.status}`
        );
        const res = await submissionsApi.patch(
            `/${submissionId}/status`,
            { status: 'approved' },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Owning organizer can approve the submission (200)',
            res.status === 200,
            `got ${res.status}`
        );
        check('Submission status is now approved', res.data?.data?.status === 'approved');
    }
    section('9. GET /hackathons/:hackathonId/submissions - organizer listing');
    {
        const asParticipant = await hackathonsApi.get(`/${hackathonId}/submissions`, {
            headers: authHeader(leaderToken),
        });
        check(
            'Rejects listing from a participant (403)',
            asParticipant.status === 403,
            `got ${asParticipant.status}`
        );
        const asNonOwningOrganizer = await hackathonsApi.get(`/${hackathonId}/submissions`, {
            headers: authHeader(organizerBToken),
        });
        check(
            'Rejects listing from a non-owning organizer (403)',
            asNonOwningOrganizer.status === 403,
            `got ${asNonOwningOrganizer.status}`
        );
        const res = await hackathonsApi.get(`/${hackathonId}/submissions`, {
            headers: authHeader(organizerAToken),
        });
        check(
            'Owning organizer can list submissions (200)',
            res.status === 200,
            `got ${res.status}`
        );
        check(
            'Listing includes the approved team submission',
            Array.isArray(res.data?.data) &&
                res.data.data.some((s) => s._id === submissionId || s.id === submissionId)
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
