import axios from 'axios';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api/auth';
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
const testUser = {
    name: 'Postman Terminal Tester',
    email: `test.user.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let accessToken = null;
let refreshCookie = null;
let resetToken = null;
const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });
async function request(
    method,
    path,
    { body: body, useAuth: useAuth = false, useCookie: useCookie = false } = {}
) {
    const headers = {};
    if (useAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (useCookie && refreshCookie) headers.Cookie = refreshCookie;
    const res = await api.request({ method: method, url: path, data: body, headers: headers });
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
        const rt = setCookie.find((c) => c.startsWith('refreshToken='));
        if (rt) refreshCookie = rt.split(';')[0];
    }
    return res;
}
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
async function run() {
    console.log(color.bold(`\nRunning Auth API tests against ${color.yellow(BASE_URL)}\n`));
    console.log(color.gray(`Test user: ${testUser.email}`));
    section('1. Signup validation');
    {
        const res = await request('post', '/signup', { body: { email: 'not-an-email' } });
        check(
            'Rejects signup with missing/invalid fields (400)',
            res.status === 400,
            `got ${res.status}`
        );
    }
    section('2. Signup');
    {
        const res = await request('post', '/signup', { body: testUser });
        check('Signup returns 201', res.status === 201, `got ${res.status}`);
        check('Signup response has success:true', res.data?.success === true);
        check(
            'Signup response includes accessToken',
            typeof res.data?.data?.accessToken === 'string'
        );
        check(
            'Signup response does NOT include password',
            res.data?.data?.user?.password === undefined
        );
        check('Refresh token cookie was set', !!refreshCookie);
        accessToken = res.data?.data?.accessToken;
    }
    section('3. Duplicate signup rejection');
    {
        const res = await request('post', '/signup', { body: testUser });
        check('Duplicate email is rejected (409)', res.status === 409, `got ${res.status}`);
    }
    section('4. Login - wrong password');
    {
        const res = await request('post', '/login', {
            body: { email: testUser.email, password: 'WrongPassword1' },
        });
        check('Wrong password is rejected (401)', res.status === 401, `got ${res.status}`);
    }
    section('5. Login - correct credentials');
    {
        const res = await request('post', '/login', {
            body: { email: testUser.email, password: testUser.password },
        });
        check('Login returns 200', res.status === 200, `got ${res.status}`);
        check(
            'Login response includes accessToken',
            typeof res.data?.data?.accessToken === 'string'
        );
        accessToken = res.data?.data?.accessToken;
    }
    section('6. GET /me - no auth header');
    {
        const res = await request('get', '/me');
        check('Rejects request with no token (401)', res.status === 401, `got ${res.status}`);
    }
    section('7. GET /me - with valid token');
    {
        const res = await request('get', '/me', { useAuth: true });
        check('Returns 200 with valid token', res.status === 200, `got ${res.status}`);
        check('Returns the correct user email', res.data?.data?.email === testUser.email);
    }
    section('8. Change password - wrong old password');
    {
        const res = await request('put', '/change-password', {
            useAuth: true,
            body: { oldPassword: 'NotTheRealPassword', newPassword: 'NewPassword456' },
        });
        check('Rejects wrong old password (400)', res.status === 400, `got ${res.status}`);
    }
    section('9. Change password - correct old password');
    {
        const res = await request('put', '/change-password', {
            useAuth: true,
            body: { oldPassword: testUser.password, newPassword: 'NewPassword456' },
        });
        check('Password change succeeds (200)', res.status === 200, `got ${res.status}`);
        testUser.password = 'NewPassword456';
    }
    section('10. Login with new password');
    {
        const res = await request('post', '/login', {
            body: { email: testUser.email, password: testUser.password },
        });
        check('New password logs in successfully (200)', res.status === 200, `got ${res.status}`);
        accessToken = res.data?.data?.accessToken;
    }
    section('11. Refresh access token via cookie');
    {
        const res = await request('post', '/refresh-token', { useCookie: true });
        check('Refresh returns 200', res.status === 200, `got ${res.status}`);
        check('Refresh returns a new accessToken', typeof res.data?.data?.accessToken === 'string');
    }
    section('12. Logout');
    {
        const res = await request('post', '/logout', { useAuth: true });
        check('Logout returns 200', res.status === 200, `got ${res.status}`);
    }
    section('13. Forgot password');
    {
        const res = await request('post', '/forgot-password', { body: { email: testUser.email } });
        check('Forgot-password returns 200', res.status === 200, `got ${res.status}`);
        resetToken = res.data?.data?.resetToken;
        check(
            'Reset token was returned (server must be NODE_ENV=development for this)',
            !!resetToken,
            resetToken ? '' : 'no resetToken in response, check server NODE_ENV'
        );
    }
    section('14. Reset password - invalid token');
    {
        const res = await request('post', '/reset-password/not-a-real-token', {
            body: { password: 'FinalPassword789' },
        });
        check('Invalid reset token is rejected (400)', res.status === 400, `got ${res.status}`);
    }
    section('15. Reset password - valid token');
    if (resetToken) {
        const res = await request('post', `/reset-password/${resetToken}`, {
            body: { password: 'FinalPassword789' },
        });
        check('Valid reset token succeeds (200)', res.status === 200, `got ${res.status}`);
        testUser.password = 'FinalPassword789';
    } else {
        console.log(color.yellow('  SKIPPED  (no resetToken available from previous step)'));
    }
    section('16. Login with password set via reset');
    {
        const res = await request('post', '/login', {
            body: { email: testUser.email, password: testUser.password },
        });
        check('Login succeeds with reset password (200)', res.status === 200, `got ${res.status}`);
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
