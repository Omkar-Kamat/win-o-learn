import axios from 'axios';
import FormData from 'form-data';
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
const TEST_PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
let passCount = 0;
let failCount = 0;
const failedTests = [];
const runId = Date.now();
const participant = {
    name: 'User Route Tester',
    email: `user.route.tester.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let participantToken = null;
let participantId = null;
let adminToken = null;
let adminId = null;
const authApi = axios.create({ baseURL: `${BASE_URL}/auth`, validateStatus: () => true });
const usersApi = axios.create({ baseURL: `${BASE_URL}/users`, validateStatus: () => true });
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
    if (res.status !== 200) return { token: null, id: null, res: res };
    return {
        token: (res.headers['set-cookie']?.find(c => c.startsWith('accessToken='))?.split(';')[0]?.split('=')[1]) || null,
        id: res.data?.data?.user?.id || res.data?.data?.user?._id || null,
        res: res,
    };
}
async function run() {
    console.log(color.bold(`\nRunning User API tests against ${color.yellow(BASE_URL)}\n`));
    console.log(color.gray(`Test participant: ${participant.email}`));
    section('Setup - create participant account');
    {
        const res = await authApi.post('/signup', participant);
        check('Participant signup succeeds (201)', res.status === 201, `got ${res.status}`);
        participantToken = (res.headers['set-cookie']?.find(c => c.startsWith('accessToken='))?.split(';')[0]?.split('=')[1]);
        participantId = res.data?.data?.user?.id || res.data?.data?.user?._id;
        check('Participant token captured', !!participantToken);
        check('Participant id captured', !!participantId);
    }
    section('1. GET /users/me - own profile');
    {
        const resNoAuth = await usersApi.get('/me');
        check(
            'Rejects request with no token (401)',
            resNoAuth.status === 401,
            `got ${resNoAuth.status}`
        );
        const res = await usersApi.get('/me', { headers: authHeader(participantToken) });
        check('Returns 200 with valid token', res.status === 200, `got ${res.status}`);
        check('Returns the correct email', res.data?.data?.email === participant.email);
        check('Does not include password field', res.data?.data?.password === undefined);
    }
    section('2. PUT /users/me - update own profile');
    {
        const res = await usersApi.put(
            '/me',
            {
                bio: 'Updated bio from the test runner',
                skills: ['javascript', 'node'],
                socials: { github: 'https://github.com/example' },
            },
            { headers: authHeader(participantToken) }
        );
        check('Profile update succeeds (200)', res.status === 200, `got ${res.status}`);
        check('Bio was updated', res.data?.data?.bio === 'Updated bio from the test runner');
        check(
            'Skills were updated',
            Array.isArray(res.data?.data?.skills) && res.data.data.skills.includes('node')
        );
    }
    section('3. PUT /users/me - blocked fields are rejected');
    {
        const res = await usersApi.put(
            '/me',
            { email: 'shouldnotwork@example.com' },
            { headers: authHeader(participantToken) }
        );
        check(
            'Rejects attempt to change email via self-update (400)',
            res.status === 400,
            `got ${res.status}`
        );
        const res2 = await usersApi.put(
            '/me',
            { role: 'admin' },
            { headers: authHeader(participantToken) }
        );
        check(
            'Rejects attempt to change role via self-update (400)',
            res2.status === 400,
            `got ${res2.status}`
        );
    }
    section('4. PUT /users/me/avatar - upload avatar');
    {
        const form = new FormData();
        form.append('avatar', Buffer.from(TEST_PNG_BASE64, 'base64'), {
            filename: 'test-avatar.png',
            contentType: 'image/png',
        });
        const res = await usersApi.put('/me/avatar', form, {
            headers: { ...form.getHeaders(), ...authHeader(participantToken) },
        });
        check('Avatar upload succeeds (200)', res.status === 200, `got ${res.status}`);
        check(
            'Response includes a new avatar URL',
            typeof res.data?.data?.avatar === 'string' && res.data.data.avatar.length > 0
        );
    }
    section('5. Non-admin is rejected from admin routes');
    {
        const res = await usersApi.get('/', { headers: authHeader(participantToken) });
        check('Participant cannot list all users (403)', res.status === 403, `got ${res.status}`);
    }
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log(
            color.yellow(
                '\nSkipping admin route tests - set ADMIN_EMAIL and ADMIN_PASSWORD to run them.'
            )
        );
    } else {
        section('Setup - log in as admin');
        const adminLogin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
        adminToken = adminLogin.token;
        adminId = adminLogin.id;
        check(
            'Admin login succeeds',
            adminLogin.res.status === 200,
            `got ${adminLogin.res.status}`
        );
        check('Admin token captured', !!adminToken);
        if (adminToken) {
            section('6. GET /users - list all users');
            {
                const res = await usersApi.get('/', { headers: authHeader(adminToken) });
                check('Returns 200', res.status === 200, `got ${res.status}`);
                check('Returns a users array', Array.isArray(res.data?.data?.users));
                check(
                    'Returns pagination metadata',
                    res.data?.data?.pagination?.totalUsers !== undefined
                );
            }
            section('6b. GET /users?search= - search filter');
            {
                const res = await usersApi.get('/', {
                    params: { search: participant.email },
                    headers: authHeader(adminToken),
                });
                check('Search returns 200', res.status === 200, `got ${res.status}`);
                const found = res.data?.data?.users?.some((u) => u.email === participant.email);
                check('Search finds the test participant', found === true);
            }
            section('7. GET /users/:id - single user');
            {
                const res = await usersApi.get(`/${participantId}`, {
                    headers: authHeader(adminToken),
                });
                check('Returns 200', res.status === 200, `got ${res.status}`);
                check('Returns the correct user', res.data?.data?.email === participant.email);
                const badRes = await usersApi.get('/not-a-valid-id', {
                    headers: authHeader(adminToken),
                });
                check(
                    'Invalid id format is rejected (400)',
                    badRes.status === 400,
                    `got ${badRes.status}`
                );
            }
            section('8. PUT /users/:id - admin edits a user');
            {
                const res = await usersApi.put(
                    `/${participantId}`,
                    { bio: 'Edited by admin' },
                    { headers: authHeader(adminToken) }
                );
                check('Admin edit succeeds (200)', res.status === 200, `got ${res.status}`);
                check('Bio reflects admin edit', res.data?.data?.bio === 'Edited by admin');
                const blockedRes = await usersApi.put(
                    `/${participantId}`,
                    { password: 'ShouldNotBeAllowed1' },
                    { headers: authHeader(adminToken) }
                );
                check(
                    'Admin cannot set password through this route (400)',
                    blockedRes.status === 400,
                    `got ${blockedRes.status}`
                );
            }
            section('9. PATCH /users/:id/block and /unblock');
            {
                const blockRes = await usersApi.patch(
                    `/${participantId}/block`,
                    {},
                    { headers: authHeader(adminToken) }
                );
                check('Block succeeds (200)', blockRes.status === 200, `got ${blockRes.status}`);
                check('User is marked blocked', blockRes.data?.data?.isBlocked === true);
                const blockedLogin = await login(participant.email, participant.password);
                check(
                    'Blocked user cannot log in (403)',
                    blockedLogin.res.status === 403,
                    `got ${blockedLogin.res.status}`
                );
                const unblockRes = await usersApi.patch(
                    `/${participantId}/unblock`,
                    {},
                    { headers: authHeader(adminToken) }
                );
                check(
                    'Unblock succeeds (200)',
                    unblockRes.status === 200,
                    `got ${unblockRes.status}`
                );
                check('User is marked unblocked', unblockRes.data?.data?.isBlocked === false);
            }
            section('10. Admin self-protection checks');
            if (adminId) {
                const selfBlockRes = await usersApi.patch(
                    `/${adminId}/block`,
                    {},
                    { headers: authHeader(adminToken) }
                );
                check(
                    'Admin cannot block their own account (400)',
                    selfBlockRes.status === 400,
                    `got ${selfBlockRes.status}`
                );
                const selfDeleteRes = await usersApi.delete(`/${adminId}`, {
                    headers: authHeader(adminToken),
                });
                check(
                    'Admin cannot delete their own account (400)',
                    selfDeleteRes.status === 400,
                    `got ${selfDeleteRes.status}`
                );
            } else {
                console.log(color.yellow('  SKIPPED  (admin id was not returned by login)'));
            }
            section('11. PATCH /users/:id/role - change role');
            {
                const res = await usersApi.patch(
                    `/${participantId}/role`,
                    { role: 'organizer' },
                    { headers: authHeader(adminToken) }
                );
                check('Role update succeeds (200)', res.status === 200, `got ${res.status}`);
                check('Role was updated to organizer', res.data?.data?.role === 'organizer');
                const badRes = await usersApi.patch(
                    `/${participantId}/role`,
                    { role: 'admin' },
                    { headers: authHeader(adminToken) }
                );
                check(
                    'Cannot promote a user to admin through this route (400)',
                    badRes.status === 400,
                    `got ${badRes.status}`
                );
            }
            section('12. DELETE /users/:id - remove test user');
            {
                const res = await usersApi.delete(`/${participantId}`, {
                    headers: authHeader(adminToken),
                });
                check('Delete succeeds (200)', res.status === 200, `got ${res.status}`);
                const getRes = await usersApi.get(`/${participantId}`, {
                    headers: authHeader(adminToken),
                });
                check(
                    'User no longer exists after delete (404)',
                    getRes.status === 404,
                    `got ${getRes.status}`
                );
            }
        }
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
