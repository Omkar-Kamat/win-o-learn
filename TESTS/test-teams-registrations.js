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
    name: 'Registration Tester Organizer A',
    email: `reg.tester.organizer.a.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const organizerB = {
    name: 'Registration Tester Organizer B',
    email: `reg.tester.organizer.b.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const leaderOne = {
    name: 'Team Tester Leader One',
    email: `team.tester.leader.one.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const memberOne = {
    name: 'Team Tester Member One',
    email: `team.tester.member.one.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const leaderTwo = {
    name: 'Team Tester Leader Two',
    email: `team.tester.leader.two.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const leaderThree = {
    name: 'Team Tester Leader Three',
    email: `team.tester.leader.three.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const memberThree = {
    name: 'Team Tester Member Three',
    email: `team.tester.member.three.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const outsider = {
    name: 'Team Tester Outsider',
    email: `team.tester.outsider.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let organizerAToken = null;
let organizerBToken = null;
let leaderOneToken = null;
let leaderOneId = null;
let memberOneToken = null;
let memberOneId = null;
let leaderTwoToken = null;
let leaderThreeToken = null;
let memberThreeId = null;
let outsiderToken = null;
let teamOneId = null;
let teamTwoId = null;
let teamThreeId = null;
let hackAId = null;
let hackBId = null;
let hackCId = null;
let hackDId = null;
let teamOneRegistrationId = null;
let teamThreeRegistrationId = null;
const authApi = axios.create({ baseURL: `${BASE_URL}/auth`, validateStatus: () => true });
const teamsApi = axios.create({ baseURL: `${BASE_URL}/teams`, validateStatus: () => true });
const hackathonsApi = axios.create({
    baseURL: `${BASE_URL}/hackathons`,
    validateStatus: () => true,
});
const registrationsApi = axios.create({
    baseURL: `${BASE_URL}/registrations`,
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
function buildHackathonPayload(overrides = {}) {
    const day = 24 * 60 * 60 * 1e3;
    const now = Date.now();
    return {
        title: `Registration Test Hackathon ${runId} ${Math.random().toString(36).slice(2, 7)}`,
        description:
            'A hackathon created by the automated team and registration route tester, padded to meet the minimum length.',
        theme: 'Automation',
        mode: 'online',
        registrationStartDate: new Date(now + 1 * day).toISOString(),
        registrationDeadline: new Date(now + 5 * day).toISOString(),
        startDate: new Date(now + 7 * day).toISOString(),
        submissionDeadline: new Date(now + 8 * day).toISOString(),
        endDate: new Date(now + 9 * day).toISOString(),
        prizePool: 1e3,
        maxTeamSize: 4,
        rules: ['Original work only'],
        judgingCriteria: [{ criterion: 'Innovation', maxMarks: 30 }],
        ...overrides,
    };
}
async function createHackathon(token, overrides = {}) {
    const res = await hackathonsApi.post('/', buildHackathonPayload(overrides), {
        headers: authHeader(token),
    });
    return { id: res.data?.data?._id || res.data?.data?.id, res: res };
}
async function run() {
    console.log(
        color.bold(`\nRunning Team and Registration API tests against ${color.yellow(BASE_URL)}\n`)
    );
    section('Setup - create test accounts');
    {
        const oa = await signup(organizerA);
        check('Organizer A signup succeeds', oa.res.status === 201, `got ${oa.res.status}`);
        organizerAToken = oa.token;
        const ob = await signup(organizerB);
        check('Organizer B signup succeeds', ob.res.status === 201, `got ${ob.res.status}`);
        organizerBToken = ob.token;
        const l1 = await signup(leaderOne);
        check('Leader one signup succeeds', l1.res.status === 201, `got ${l1.res.status}`);
        leaderOneToken = l1.token;
        leaderOneId = l1.id;
        const m1 = await signup(memberOne);
        check('Member one signup succeeds', m1.res.status === 201, `got ${m1.res.status}`);
        memberOneToken = m1.token;
        memberOneId = m1.id;
        const l2 = await signup(leaderTwo);
        check('Leader two signup succeeds', l2.res.status === 201, `got ${l2.res.status}`);
        leaderTwoToken = l2.token;
        const l3 = await signup(leaderThree);
        check('Leader three signup succeeds', l3.res.status === 201, `got ${l3.res.status}`);
        leaderThreeToken = l3.token;
        const m3 = await signup(memberThree);
        check('Member three signup succeeds', m3.res.status === 201, `got ${m3.res.status}`);
        memberThreeId = m3.id;
        const out = await signup(outsider);
        check('Outsider signup succeeds', out.res.status === 201, `got ${out.res.status}`);
        outsiderToken = out.token;
    }
    section('Setup - create test hackathons');
    {
        const a = await createHackathon(organizerAToken, { maxTeamSize: 4 });
        check('Hackathon A created', a.res.status === 201, `got ${a.res.status}`);
        hackAId = a.id;
        const b = await createHackathon(organizerAToken, { maxTeamSize: 4 });
        check('Hackathon B created', b.res.status === 201, `got ${b.res.status}`);
        hackBId = b.id;
        const c = await createHackathon(organizerAToken, { maxTeamSize: 1 });
        check('Hackathon C created', c.res.status === 201, `got ${c.res.status}`);
        hackCId = c.id;
        const d = await createHackathon(organizerAToken, { maxTeamSize: 4 });
        check('Hackathon D created', d.res.status === 201, `got ${d.res.status}`);
        hackDId = d.id;
        const openA = await hackathonsApi.patch(
            `/${hackAId}/open-registration`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check('Hackathon A registration opened', openA.status === 200, `got ${openA.status}`);
        const openC = await hackathonsApi.patch(
            `/${hackCId}/open-registration`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check('Hackathon C registration opened', openC.status === 200, `got ${openC.status}`);
        const openD = await hackathonsApi.patch(
            `/${hackDId}/open-registration`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check('Hackathon D registration opened', openD.status === 200, `got ${openD.status}`);
    }
    section('1. POST /teams - validation');
    {
        const noAuth = await teamsApi.post('/', { name: 'No Auth Team' });
        check('Rejects create with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const wrongRole = await teamsApi.post(
            '/',
            { name: 'Wrong Role Team' },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects create from an organizer (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const missingName = await teamsApi.post('/', {}, { headers: authHeader(leaderOneToken) });
        check(
            'Rejects create with missing name (400)',
            missingName.status === 400,
            `got ${missingName.status}`
        );
        const shortName = await teamsApi.post(
            '/',
            { name: 'ab' },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with too short name (400)',
            shortName.status === 400,
            `got ${shortName.status}`
        );
        const membersNotArray = await teamsApi.post(
            '/',
            { name: 'Bad Members Team', members: 'not-an-array' },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with non-array members (400)',
            membersNotArray.status === 400,
            `got ${membersNotArray.status}`
        );
        const emptyMembers = await teamsApi.post(
            '/',
            { name: 'Empty Members Team', members: [] },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with empty members array (400)',
            emptyMembers.status === 400,
            `got ${emptyMembers.status}`
        );
        const badMemberId = await teamsApi.post(
            '/',
            { name: 'Bad Member Id Team', members: ['not-a-valid-id'] },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with invalid member id (400)',
            badMemberId.status === 400,
            `got ${badMemberId.status}`
        );
        const duplicateMembers = await teamsApi.post(
            '/',
            { name: 'Duplicate Members Team', members: [memberOneId, memberOneId] },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with duplicate members (400)',
            duplicateMembers.status === 400,
            `got ${duplicateMembers.status}`
        );
        const leaderInMembers = await teamsApi.post(
            '/',
            { name: 'Leader In Members Team', members: [leaderOneId] },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with leader listed as a member (400)',
            leaderInMembers.status === 400,
            `got ${leaderInMembers.status}`
        );
        const leaderProvided = await teamsApi.post(
            '/',
            { name: 'Explicit Leader Team', leader: leaderOneId, members: [memberOneId] },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with leader field provided (400)',
            leaderProvided.status === 400,
            `got ${leaderProvided.status}`
        );
        const createdAtProvided = await teamsApi.post(
            '/',
            { name: 'Timestamped Team', createdAt: new Date().toISOString() },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects create with createdAt provided (400)',
            createdAtProvided.status === 400,
            `got ${createdAtProvided.status}`
        );
    }
    section('2. POST /teams - success');
    {
        const res = await teamsApi.post(
            '/',
            { name: 'Team One', members: [memberOneId] },
            { headers: authHeader(leaderOneToken) }
        );
        check('Create team one succeeds (201)', res.status === 201, `got ${res.status}`);
        check('Team one leader matches the creator', res.data?.data?.leader?._id === leaderOneId);
        check(
            'Team one includes the added member',
            res.data?.data?.members?.some((m) => m._id === memberOneId)
        );
        teamOneId = res.data?.data?._id || res.data?.data?.id;
        check('Team one id captured', !!teamOneId);
        const soloRes = await teamsApi.post(
            '/',
            { name: 'Team Two' },
            { headers: authHeader(leaderTwoToken) }
        );
        check(
            'Create team two with no extra members succeeds (201)',
            soloRes.status === 201,
            `got ${soloRes.status}`
        );
        check('Team two only contains the leader', soloRes.data?.data?.members?.length === 1);
        teamTwoId = soloRes.data?.data?._id || soloRes.data?.data?.id;
        const overlapRes = await teamsApi.post(
            '/',
            { name: 'Team Two Overlap', members: [memberOneId] },
            { headers: authHeader(leaderTwoToken) }
        );
        check(
            'Create overlapping team two succeeds (201)',
            overlapRes.status === 201,
            `got ${overlapRes.status}`
        );
        teamTwoId = overlapRes.data?.data?._id || overlapRes.data?.data?.id;
        const teamThreeRes = await teamsApi.post(
            '/',
            { name: 'Team Three', members: [memberThreeId] },
            { headers: authHeader(leaderThreeToken) }
        );
        check(
            'Create team three succeeds (201)',
            teamThreeRes.status === 201,
            `got ${teamThreeRes.status}`
        );
        teamThreeId = teamThreeRes.data?.data?._id || teamThreeRes.data?.data?.id;
    }
    section('3. POST /hackathons/:hackathonId/register - validation');
    {
        const noAuth = await hackathonsApi.post(`/${hackAId}/register`, { teamId: teamOneId });
        check(
            'Rejects register with no token (401)',
            noAuth.status === 401,
            `got ${noAuth.status}`
        );
        const wrongRole = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: teamOneId },
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejects register from an organizer (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const missingTeamId = await hackathonsApi.post(
            `/${hackAId}/register`,
            {},
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects register with missing teamId (400)',
            missingTeamId.status === 400,
            `got ${missingTeamId.status}`
        );
        const badTeamId = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: 'not-a-valid-id' },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects register with invalid teamId format (400)',
            badTeamId.status === 400,
            `got ${badTeamId.status}`
        );
        const badHackathonId = await hackathonsApi.post(
            '/not-a-valid-id/register',
            { teamId: teamOneId },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects register with invalid hackathonId format (400)',
            badHackathonId.status === 400,
            `got ${badHackathonId.status}`
        );
        const protectedField = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: teamOneId, status: 'approved' },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects register with protected status field (400)',
            protectedField.status === 400,
            `got ${protectedField.status}`
        );
        const notFoundHackathon = await hackathonsApi.post(
            '/64b64b64b64b64b64b64b64b/register',
            { teamId: teamOneId },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Register against a nonexistent hackathon returns 404',
            notFoundHackathon.status === 404,
            `got ${notFoundHackathon.status}`
        );
        const notLeader = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: teamOneId },
            { headers: authHeader(memberOneToken) }
        );
        check(
            'Rejects register from a non-leader team member (403)',
            notLeader.status === 403,
            `got ${notLeader.status}`
        );
        const closedRegistration = await hackathonsApi.post(
            `/${hackBId}/register`,
            { teamId: teamTwoId },
            { headers: authHeader(leaderTwoToken) }
        );
        check(
            'Rejects register while registration is closed (400)',
            closedRegistration.status === 400,
            `got ${closedRegistration.status}`
        );
        const teamTooLarge = await hackathonsApi.post(
            `/${hackCId}/register`,
            { teamId: teamOneId },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects register when team exceeds max team size (400)',
            teamTooLarge.status === 400,
            `got ${teamTooLarge.status}`
        );
    }
    section('4. POST /hackathons/:hackathonId/register - success and conflicts');
    {
        const res = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: teamOneId },
            { headers: authHeader(leaderOneToken) }
        );
        check('Team one registers on hackathon A (201)', res.status === 201, `got ${res.status}`);
        check('New registration status is pending', res.data?.data?.status === 'pending');
        teamOneRegistrationId = res.data?.data?._id || res.data?.data?.id;
        check('Registration id captured', !!teamOneRegistrationId);
        const duplicate = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: teamOneId },
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects duplicate registration for the same team (409)',
            duplicate.status === 409,
            `got ${duplicate.status}`
        );
        const overlap = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: teamTwoId },
            { headers: authHeader(leaderTwoToken) }
        );
        check(
            'Rejects registration when a member is already registered on another team (409)',
            overlap.status === 409,
            `got ${overlap.status}`
        );
        const teamThreeRes = await hackathonsApi.post(
            `/${hackAId}/register`,
            { teamId: teamThreeId },
            { headers: authHeader(leaderThreeToken) }
        );
        check(
            'Team three registers on hackathon A (201)',
            teamThreeRes.status === 201,
            `got ${teamThreeRes.status}`
        );
        teamThreeRegistrationId = teamThreeRes.data?.data?._id || teamThreeRes.data?.data?.id;
        const teamTwoOnD = await hackathonsApi.post(
            `/${hackDId}/register`,
            { teamId: teamTwoId },
            { headers: authHeader(leaderTwoToken) }
        );
        check(
            'Team two registers on isolated hackathon D (201)',
            teamTwoOnD.status === 201,
            `got ${teamTwoOnD.status}`
        );
    }
    section('5. GET /hackathons/:hackathonId/register/status/:teamId');
    {
        const noAuth = await hackathonsApi.get(`/${hackAId}/register/status/${teamOneId}`);
        check(
            'Rejects status check with no token (401)',
            noAuth.status === 401,
            `got ${noAuth.status}`
        );
        const wrongRole = await hackathonsApi.get(`/${hackAId}/register/status/${teamOneId}`, {
            headers: authHeader(organizerAToken),
        });
        check(
            'Rejects status check from an organizer (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const notMember = await hackathonsApi.get(`/${hackAId}/register/status/${teamOneId}`, {
            headers: authHeader(outsiderToken),
        });
        check(
            'Rejects status check from a non-member (403)',
            notMember.status === 403,
            `got ${notMember.status}`
        );
        const registeredRes = await hackathonsApi.get(`/${hackAId}/register/status/${teamOneId}`, {
            headers: authHeader(memberOneToken),
        });
        check(
            'Registered team member can read status (200)',
            registeredRes.status === 200,
            `got ${registeredRes.status}`
        );
        check('Status reports registered:true', registeredRes.data?.data?.registered === true);
        check('Status reports pending', registeredRes.data?.data?.status === 'pending');
        const notRegisteredRes = await hackathonsApi.get(
            `/${hackBId}/register/status/${teamOneId}`,
            { headers: authHeader(memberOneToken) }
        );
        check(
            'Team never registered on hackathon B reports registered:false',
            notRegisteredRes.data?.data?.registered === false
        );
    }
    section('6. DELETE /hackathons/:hackathonId/register/:teamId - cancel');
    {
        const noAuth = await hackathonsApi.delete(`/${hackDId}/register/${teamTwoId}`);
        check('Rejects cancel with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const notLeader = await hackathonsApi.delete(`/${hackDId}/register/${teamTwoId}`, {
            headers: authHeader(memberOneToken),
        });
        check(
            'Rejects cancel from a non-leader (403)',
            notLeader.status === 403,
            `got ${notLeader.status}`
        );
        const neverRegistered = await hackathonsApi.delete(`/${hackBId}/register/${teamTwoId}`, {
            headers: authHeader(leaderTwoToken),
        });
        check(
            'Cancel on a hackathon never registered for returns 404',
            neverRegistered.status === 404,
            `got ${neverRegistered.status}`
        );
        const res = await hackathonsApi.delete(`/${hackDId}/register/${teamTwoId}`, {
            headers: authHeader(leaderTwoToken),
        });
        check(
            'Leader cancels team two registration on hackathon D (200)',
            res.status === 200,
            `got ${res.status}`
        );
        const cancelAgain = await hackathonsApi.delete(`/${hackDId}/register/${teamTwoId}`, {
            headers: authHeader(leaderTwoToken),
        });
        check(
            'Cancelling an already cancelled registration returns 404',
            cancelAgain.status === 404,
            `got ${cancelAgain.status}`
        );
        const statusAfterCancel = await hackathonsApi.get(
            `/${hackDId}/register/status/${teamTwoId}`,
            { headers: authHeader(leaderTwoToken) }
        );
        check(
            'Status after cancel reports registered:false',
            statusAfterCancel.data?.data?.registered === false
        );
    }
    section('7. GET /hackathons/:hackathonId/registrations - organizer listing');
    {
        const noAuth = await hackathonsApi.get(`/${hackAId}/registrations`);
        check('Rejects listing with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const wrongRole = await hackathonsApi.get(`/${hackAId}/registrations`, {
            headers: authHeader(leaderOneToken),
        });
        check(
            'Rejects listing from a participant (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const notOwner = await hackathonsApi.get(`/${hackAId}/registrations`, {
            headers: authHeader(organizerBToken),
        });
        check(
            'Rejects listing from a non-owning organizer (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const res = await hackathonsApi.get(`/${hackAId}/registrations`, {
            headers: authHeader(organizerAToken),
        });
        check('Owner can list registrations (200)', res.status === 200, `got ${res.status}`);
        check(
            'Response includes pagination metadata',
            res.data?.data?.pagination?.totalRegistrations !== undefined
        );
        const containsTeamOne = res.data?.data?.registrations?.some(
            (r) => (r._id || r.id) === teamOneRegistrationId
        );
        check('Listing includes team one registration', containsTeamOne === true);
        const filteredRes = await hackathonsApi.get(`/${hackAId}/registrations`, {
            params: { status: 'pending' },
            headers: authHeader(organizerAToken),
        });
        check('Status filter returns 200', filteredRes.status === 200, `got ${filteredRes.status}`);
        const badStatusFilter = await hackathonsApi.get(`/${hackAId}/registrations`, {
            params: { status: 'not-a-status' },
            headers: authHeader(organizerAToken),
        });
        check(
            'Invalid status filter is rejected (400)',
            badStatusFilter.status === 400,
            `got ${badStatusFilter.status}`
        );
    }
    section('8. PATCH /registrations/:registrationId/approve');
    {
        const noAuth = await registrationsApi.patch(`/${teamOneRegistrationId}/approve`);
        check('Rejects approve with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const wrongRole = await registrationsApi.patch(
            `/${teamOneRegistrationId}/approve`,
            {},
            { headers: authHeader(leaderOneToken) }
        );
        check(
            'Rejects approve from a participant (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const notOwner = await registrationsApi.patch(
            `/${teamOneRegistrationId}/approve`,
            {},
            { headers: authHeader(organizerBToken) }
        );
        check(
            'Rejects approve from a non-owning organizer (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const badId = await registrationsApi.patch(
            '/not-a-valid-id/approve',
            {},
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Invalid registration id format is rejected (400)',
            badId.status === 400,
            `got ${badId.status}`
        );
        const notFound = await registrationsApi.patch(
            '/64b64b64b64b64b64b64b64b/approve',
            {},
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Approving a nonexistent registration returns 404',
            notFound.status === 404,
            `got ${notFound.status}`
        );
        const res = await registrationsApi.patch(
            `/${teamOneRegistrationId}/approve`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check('Owner approves the registration (200)', res.status === 200, `got ${res.status}`);
        check('Registration status is now approved', res.data?.data?.status === 'approved');
        const approveAgain = await registrationsApi.patch(
            `/${teamOneRegistrationId}/approve`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Approving an already approved registration is rejected (400)',
            approveAgain.status === 400,
            `got ${approveAgain.status}`
        );
    }
    section('9. PATCH /registrations/:registrationId/reject');
    {
        const wrongRole = await registrationsApi.patch(
            `/${teamThreeRegistrationId}/reject`,
            {},
            { headers: authHeader(leaderThreeToken) }
        );
        check(
            'Rejects reject action from a participant (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const notOwner = await registrationsApi.patch(
            `/${teamThreeRegistrationId}/reject`,
            {},
            { headers: authHeader(organizerBToken) }
        );
        check(
            'Rejects reject action from a non-owning organizer (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const res = await registrationsApi.patch(
            `/${teamThreeRegistrationId}/reject`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Owner rejects team three registration (200)',
            res.status === 200,
            `got ${res.status}`
        );
        check('Registration status is now rejected', res.data?.data?.status === 'rejected');
        const rejectAgain = await registrationsApi.patch(
            `/${teamThreeRegistrationId}/reject`,
            {},
            { headers: authHeader(organizerAToken) }
        );
        check(
            'Rejecting an already rejected registration is rejected (400)',
            rejectAgain.status === 400,
            `got ${rejectAgain.status}`
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
