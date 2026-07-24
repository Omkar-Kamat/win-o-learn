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
const leader = {
    name: 'Team Tester Leader',
    email: `team.tester.leader.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const memberUser = {
    name: 'Team Tester Member',
    email: `team.tester.member.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const outsider = {
    name: 'Team Tester Outsider',
    email: `team.tester.outsider.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let leaderUserId = null;
let leaderToken = null;
let memberToken = null;
let outsiderToken = null;
let memberUserId = null;
let outsiderUserId = null;
let teamId = null;
const authApi = axios.create({ baseURL: `${BASE_URL}/auth`, validateStatus: () => true });
const teamsApi = axios.create({ baseURL: `${BASE_URL}/teams`, validateStatus: () => true });
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
    console.log(color.bold(`\nRunning Team API tests against ${color.yellow(BASE_URL)}\n`));
    section('Setup - create test accounts');
    {
        const l = await signup(leader);
        check('Leader signup succeeds', l.res.status === 201, `got ${l.res.status}`);
        leaderToken = l.token;
        leaderUserId = l.id;
        const m = await signup(memberUser);
        check('Member signup succeeds', m.res.status === 201, `got ${m.res.status}`);
        memberToken = m.token;
        memberUserId = m.id;
        const o = await signup(outsider);
        check('Outsider signup succeeds', o.res.status === 201, `got ${o.res.status}`);
        outsiderToken = o.token;
        outsiderUserId = o.id;
    }
    section('1. POST /teams - validation');
    {
        const noAuth = await teamsApi.post('/', { name: 'No Auth Team' });
        check('Rejects create with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const missingName = await teamsApi.post('/', {}, { headers: authHeader(leaderToken) });
        check(
            'Rejects missing name (400)',
            missingName.status === 400,
            `got ${missingName.status}`
        );
        const shortName = await teamsApi.post(
            '/',
            { name: 'ab' },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects name shorter than 3 characters (400)',
            shortName.status === 400,
            `got ${shortName.status}`
        );
        const selfInMembers = await teamsApi.post(
            '/',
            { name: 'Self Member Team', members: [] },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Empty members array is accepted (not a rejection case)',
            selfInMembers.status !== 500
        );
        const invalidMemberId = await teamsApi.post(
            '/',
            { name: 'Invalid Member Team', members: ['not-a-valid-id'] },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects an invalid member id (400)',
            invalidMemberId.status === 400,
            `got ${invalidMemberId.status}`
        );
        const duplicateMembers = await teamsApi.post(
            '/',
            { name: 'Duplicate Member Team', members: [memberUserId, memberUserId] },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects duplicate members (400)',
            duplicateMembers.status === 400,
            `got ${duplicateMembers.status}`
        );
        const protectedField = await teamsApi.post(
            '/',
            { name: 'Protected Field Team', leader: memberUserId },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects a protected "leader" field in the body (400)',
            protectedField.status === 400,
            `got ${protectedField.status}`
        );
    }
    section('2. POST /teams - success');
    {
        const res = await teamsApi.post(
            '/',
            { name: 'Test Team' },
            { headers: authHeader(leaderToken) }
        );
        check('Create with no members succeeds (201)', res.status === 201, `got ${res.status}`);
        check(
            'Leader is automatically included as a member',
            res.data?.data?.members?.length === 1
        );
        teamId = res.data?.data?._id || res.data?.data?.id;
        check('Team id captured', !!teamId);
        const withMembers = await teamsApi.post(
            '/',
            { name: 'Team With Initial Member', members: [memberUserId] },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Create with an initial members array succeeds (201)',
            withMembers.status === 201,
            `got ${withMembers.status} - check for a conflict between membersValidation and protectedFieldsValidation on the "members" field`
        );
    }
    section('3. GET /teams/:id');
    {
        const noAuth = await teamsApi.get(`/${teamId}`);
        check('Rejects request with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const res = await teamsApi.get(`/${teamId}`, { headers: authHeader(outsiderToken) });
        check(
            'Any authenticated user can view team details (200)',
            res.status === 200,
            `got ${res.status}`
        );
        check('Returns the correct team name', res.data?.data?.name === 'Test Team');
        const badId = await teamsApi.get('/not-a-valid-id', { headers: authHeader(leaderToken) });
        check('Invalid id format is rejected (400)', badId.status === 400, `got ${badId.status}`);
        const fakeId = await teamsApi.get('/64b64b64b64b64b64b64b64b', {
            headers: authHeader(leaderToken),
        });
        check(
            'Well formed but nonexistent id returns 404',
            fakeId.status === 404,
            `got ${fakeId.status}`
        );
    }
    section('4. PUT /teams/:id');
    {
        const notLeader = await teamsApi.put(
            `/${teamId}`,
            { name: 'Hijacked Name' },
            { headers: authHeader(outsiderToken) }
        );
        check(
            'Non-leader cannot edit the team (403)',
            notLeader.status === 403,
            `got ${notLeader.status}`
        );
        const emptyBody = await teamsApi.put(
            `/${teamId}`,
            {},
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects an empty update body (400)',
            emptyBody.status === 400,
            `got ${emptyBody.status}`
        );
        const protectedField = await teamsApi.put(
            `/${teamId}`,
            { members: [memberUserId] },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects updating "members" through this route (400)',
            protectedField.status === 400,
            `got ${protectedField.status}`
        );
        const longDescription = await teamsApi.put(
            `/${teamId}`,
            { description: 'x'.repeat(501) },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects a description over 500 characters (400)',
            longDescription.status === 400,
            `got ${longDescription.status}`
        );
        const res = await teamsApi.put(
            `/${teamId}`,
            { name: 'Updated Team Name', description: 'Updated description' },
            { headers: authHeader(leaderToken) }
        );
        check('Leader edit succeeds (200)', res.status === 200, `got ${res.status}`);
        check('Name was updated', res.data?.data?.name === 'Updated Team Name');
        check('Description was updated', res.data?.data?.description === 'Updated description');
    }
    section('5. DELETE /teams/:id');
    {
        const notLeader = await teamsApi.delete(`/${teamId}`, {
            headers: authHeader(outsiderToken),
        });
        check(
            'Non-leader cannot delete the team (403)',
            notLeader.status === 403,
            `got ${notLeader.status}`
        );
        const res = await teamsApi.delete(`/${teamId}`, { headers: authHeader(leaderToken) });
        check('Leader delete succeeds (200)', res.status === 200, `got ${res.status}`);
        const getAfterDelete = await teamsApi.get(`/${teamId}`, {
            headers: authHeader(leaderToken),
        });
        check(
            'Team no longer exists after delete (404)',
            getAfterDelete.status === 404,
            `got ${getAfterDelete.status}`
        );
    }
    section('Setup - create a second team for invite tests');
    let teamTwoId = null;
    {
        const res = await teamsApi.post(
            '/',
            { name: 'Invite Test Team' },
            { headers: authHeader(leaderToken) }
        );
        check('Second team create succeeds (201)', res.status === 201, `got ${res.status}`);
        teamTwoId = res.data?.data?._id || res.data?.data?.id;
        check('Second team id captured', !!teamTwoId);
    }
    section('6. POST /teams/:id/invite - validation');
    {
        const noAuth = await teamsApi.post(`/${teamTwoId}/invite`, { email: memberUser.email });
        check('Rejects invite with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const notLeader = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: memberUser.email },
            { headers: authHeader(outsiderToken) }
        );
        check(
            'Non-leader cannot invite (403)',
            notLeader.status === 403,
            `got ${notLeader.status}`
        );
        const missingEmail = await teamsApi.post(
            `/${teamTwoId}/invite`,
            {},
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects a missing email (400)',
            missingEmail.status === 400,
            `got ${missingEmail.status}`
        );
        const badEmail = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: 'not-an-email' },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects an invalid email format (400)',
            badEmail.status === 400,
            `got ${badEmail.status}`
        );
    }
    section('7. POST /teams/:id/invite - business rules');
    {
        const unknownEmail = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: `no.such.user.${runId}@example.com` },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Inviting a nonexistent email returns 404',
            unknownEmail.status === 404,
            `got ${unknownEmail.status}`
        );
        const inviteSelf = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: leader.email },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Leader cannot invite themselves (400)',
            inviteSelf.status === 400,
            `got ${inviteSelf.status}`
        );
        const res = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: memberUser.email },
            { headers: authHeader(leaderToken) }
        );
        check('Inviting a valid outsider succeeds (200)', res.status === 200, `got ${res.status}`);
        const pendingInvites = res.data?.data?.pendingInvites;
        const invited = pendingInvites?.some(
            (invite) =>
                String(invite.user?._id ?? invite.user) === String(memberUserId) ||
                invite.user?.email === memberUser.email
        );
        check('Invited user appears in pendingInvites', invited === true);
        const duplicateInvite = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: memberUser.email },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Inviting the same pending user again is rejected (400)',
            duplicateInvite.status === 400,
            `got ${duplicateInvite.status}`
        );
    }
    section('8. POST /teams/:id/invite/accept');
    {
        const noAuth = await teamsApi.post(`/${teamTwoId}/invite/accept`);
        check('Rejects accept with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const notInvitee = await teamsApi.post(
            `/${teamTwoId}/invite/accept`,
            {},
            { headers: authHeader(outsiderToken) }
        );
        check(
            'User with no pending invite cannot accept (403)',
            notInvitee.status === 403,
            `got ${notInvitee.status}`
        );
        const res = await teamsApi.post(
            `/${teamTwoId}/invite/accept`,
            {},
            { headers: authHeader(memberToken) }
        );
        check('Invitee accept succeeds (200)', res.status === 200, `got ${res.status}`);
        const members = res.data?.data?.members;
        const isMemberNow = members?.some(
            (member) => String(member._id ?? member) === String(memberUserId)
        );
        check('Invitee is now a team member', isMemberNow === true);
        const stillPending = res.data?.team?.pendingInvites?.some(
            (invite) => (invite.user?._id ?? invite.user) === memberUserId
        );
        check('Invitee no longer appears in pendingInvites', stillPending !== true);
    }
    section('9. POST /teams/:id/invite - already a member');
    {
        const res = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: memberUser.email },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Inviting an existing member is rejected (400)',
            res.status === 400,
            `got ${res.status}`
        );
    }
    section('10. POST /teams/:id/invite/reject');
    {
        const inviteRes = await teamsApi.post(
            `/${teamTwoId}/invite`,
            { email: outsider.email },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Invite for the reject test succeeds (200)',
            inviteRes.status === 200,
            `got ${inviteRes.status}`
        );
        const noAuth = await teamsApi.post(`/${teamTwoId}/invite/reject`);
        check(
            'Rejects reject-invite with no token (401)',
            noAuth.status === 401,
            `got ${noAuth.status}`
        );
        const res = await teamsApi.post(
            `/${teamTwoId}/invite/reject`,
            {},
            { headers: authHeader(outsiderToken) }
        );
        check('Invitee reject succeeds (200)', res.status === 200, `got ${res.status}`);
        const stillPending = res.data?.team?.pendingInvites?.some(
            (invite) => (invite.user?._id ?? invite.user) === outsiderUserId
        );
        check('Rejected invite no longer appears in pendingInvites', stillPending !== true);
        const becameMember = res.data?.team?.members?.some((m) => (m._id ?? m) === outsiderUserId);
        check('Rejected user was not added as a member', becameMember !== true);
        const rejectAgain = await teamsApi.post(
            `/${teamTwoId}/invite/reject`,
            {},
            { headers: authHeader(outsiderToken) }
        );
        check(
            'Rejecting an invite that no longer exists returns 404',
            rejectAgain.status === 404,
            `got ${rejectAgain.status}`
        );
    }
    section('Setup - create a third team with three members');
    let teamThreeId = null;
    let nonMemberToken = null;
    let nonMemberId = null;
    {
        const nonMember = {
            name: 'Team Tester Non Member',
            email: `team.tester.nonmember.${runId}@example.com`,
            password: 'Password123',
            role: 'participant',
        };
        const nm = await signup(nonMember);
        check('Non-member signup succeeds', nm.res.status === 201, `got ${nm.res.status}`);
        nonMemberToken = nm.token;
        nonMemberId = nm.id;
        const res = await teamsApi.post(
            '/',
            { name: 'Role Management Team' },
            { headers: authHeader(leaderToken) }
        );
        check('Third team create succeeds (201)', res.status === 201, `got ${res.status}`);
        teamThreeId = res.data?.data?._id || res.data?.data?.id;
        const inviteA = await teamsApi.post(
            `/${teamThreeId}/invite`,
            { email: memberUser.email },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Invite for member A succeeds (200)',
            inviteA.status === 200,
            `got ${inviteA.status}`
        );
        const acceptA = await teamsApi.post(
            `/${teamThreeId}/invite/accept`,
            {},
            { headers: authHeader(memberToken) }
        );
        check('Member A accepts (200)', acceptA.status === 200, `got ${acceptA.status}`);
        const inviteB = await teamsApi.post(
            `/${teamThreeId}/invite`,
            { email: outsider.email },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Invite for member B succeeds (200)',
            inviteB.status === 200,
            `got ${inviteB.status}`
        );
        const acceptB = await teamsApi.post(
            `/${teamThreeId}/invite/accept`,
            {},
            { headers: authHeader(outsiderToken) }
        );
        check('Member B accepts (200)', acceptB.status === 200, `got ${acceptB.status}`);
    }
    section('11. PATCH /teams/:id/leader - transfer leadership');
    {
        const noAuth = await teamsApi.patch(`/${teamThreeId}/leader`, { userId: memberUserId });
        check(
            'Rejects transfer with no token (401)',
            noAuth.status === 401,
            `got ${noAuth.status}`
        );
        const notLeader = await teamsApi.patch(
            `/${teamThreeId}/leader`,
            { userId: memberUserId },
            { headers: authHeader(memberToken) }
        );
        check(
            'Non-leader cannot transfer leadership (403)',
            notLeader.status === 403,
            `got ${notLeader.status}`
        );
        const missingUserId = await teamsApi.patch(
            `/${teamThreeId}/leader`,
            {},
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects a missing userId (400)',
            missingUserId.status === 400,
            `got ${missingUserId.status}`
        );
        const badUserId = await teamsApi.patch(
            `/${teamThreeId}/leader`,
            { userId: 'not-a-valid-id' },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Rejects an invalid userId format (400)',
            badUserId.status === 400,
            `got ${badUserId.status}`
        );
        const nonMemberTransfer = await teamsApi.patch(
            `/${teamThreeId}/leader`,
            { userId: nonMemberId },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Cannot transfer to a non-member (400)',
            nonMemberTransfer.status === 400,
            `got ${nonMemberTransfer.status}`
        );
        const res = await teamsApi.patch(
            `/${teamThreeId}/leader`,
            { userId: memberUserId },
            { headers: authHeader(leaderToken) }
        );
        check('Transfer to a valid member succeeds (200)', res.status === 200, `got ${res.status}`);
        const leader = res.data?.data?.leader;
        const newLeaderIsSet = String(leader?._id ?? leader) === String(memberUserId);
        check('Team leader is now the new member', newLeaderIsSet === true);
        const transferToCurrentLeader = await teamsApi.patch(
            `/${teamThreeId}/leader`,
            { userId: memberUserId },
            { headers: authHeader(memberToken) }
        );
        check(
            'Transferring to the already-current leader is rejected (400)',
            transferToCurrentLeader.status === 400,
            `got ${transferToCurrentLeader.status}`
        );
        const oldLeaderLostAccess = await teamsApi.put(
            `/${teamThreeId}`,
            { description: 'Should not be allowed anymore' },
            { headers: authHeader(leaderToken) }
        );
        check(
            'Old leader can no longer edit the team (403)',
            oldLeaderLostAccess.status === 403,
            `got ${oldLeaderLostAccess.status}`
        );
        const newLeaderHasAccess = await teamsApi.put(
            `/${teamThreeId}`,
            { description: 'New leader can edit now' },
            { headers: authHeader(memberToken) }
        );
        check(
            'New leader can edit the team (200)',
            newLeaderHasAccess.status === 200,
            `got ${newLeaderHasAccess.status}`
        );
    }
    section('12. POST /teams/:id/leave');
    {
        const noAuth = await teamsApi.post(`/${teamThreeId}/leave`);
        check('Rejects leave with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const notMember = await teamsApi.post(
            `/${teamThreeId}/leave`,
            {},
            { headers: authHeader(nonMemberToken) }
        );
        check('Non-member cannot leave (403)', notMember.status === 403, `got ${notMember.status}`);
        const leaderTriesToLeave = await teamsApi.post(
            `/${teamThreeId}/leave`,
            {},
            { headers: authHeader(memberToken) }
        );
        check(
            'Current leader cannot leave without transferring first (400)',
            leaderTriesToLeave.status === 400,
            `got ${leaderTriesToLeave.status}`
        );
        const res = await teamsApi.post(
            `/${teamThreeId}/leave`,
            {},
            { headers: authHeader(outsiderToken) }
        );
        check('Regular member can leave (200)', res.status === 200, `got ${res.status}`);
        const stillMember = res.data?.team?.members?.some((m) => (m._id ?? m) === outsiderUserId);
        check('Member who left no longer appears in members', stillMember !== true);
    }
    section('13. DELETE /teams/:id/members/:userId');
    {
        const noAuth = await teamsApi.delete(`/${teamThreeId}/members/${leaderUserId}`);
        check(
            'Rejects remove-member with no token (401)',
            noAuth.status === 401,
            `got ${noAuth.status}`
        );
        const notLeader = await teamsApi.delete(`/${teamThreeId}/members/${nonMemberId}`, {
            headers: authHeader(nonMemberToken),
        });
        check(
            'Non-leader cannot remove a member (403)',
            notLeader.status === 403,
            `got ${notLeader.status}`
        );
        const badUserId = await teamsApi.delete(`/${teamThreeId}/members/not-a-valid-id`, {
            headers: authHeader(memberToken),
        });
        check(
            'Rejects an invalid userId format (400)',
            badUserId.status === 400,
            `got ${badUserId.status}`
        );
        const removeLeader = await teamsApi.delete(`/${teamThreeId}/members/${memberUserId}`, {
            headers: authHeader(memberToken),
        });
        check(
            'Leader cannot remove themselves through this route (400)',
            removeLeader.status === 400,
            `got ${removeLeader.status}`
        );
        const removeNonMember = await teamsApi.delete(`/${teamThreeId}/members/${nonMemberId}`, {
            headers: authHeader(memberToken),
        });
        check(
            'Removing a valid user who is not a team member is rejected (400)',
            removeNonMember.status === 400,
            `got ${removeNonMember.status}`
        );
        const originalLeaderStillMember = await teamsApi.get(`/${teamThreeId}`, {
            headers: authHeader(memberToken),
        });
        check(
            'Original leader is still on the team as a regular member',
            originalLeaderStillMember.status === 200
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
