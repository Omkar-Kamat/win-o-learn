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
const organizerOne = {
    name: 'Hackathon Route Tester One',
    email: `hackathon.tester.one.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const organizerTwo = {
    name: 'Hackathon Route Tester Two',
    email: `hackathon.tester.two.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const participant = {
    name: 'Hackathon Route Tester Participant',
    email: `hackathon.tester.participant.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let organizerOneToken = null;
let organizerTwoToken = null;
let participantToken = null;
let adminToken = null;
let hackathonId = null;
let pastDeadlineHackathonId = null;
const authApi = axios.create({ baseURL: `${BASE_URL}/auth`, validateStatus: () => true });
const hackathonsApi = axios.create({
    baseURL: `${BASE_URL}/hackathons`,
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
async function login(email, password) {
    const res = await authApi.post('/login', { email: email, password: password });
    return { token: (res.headers['set-cookie']?.find(c => c.startsWith('accessToken='))?.split(';')[0]?.split('=')[1]) || null, res: res };
}
async function signup(user) {
    const res = await authApi.post('/signup', user);
    return { token: (res.headers['set-cookie']?.find(c => c.startsWith('accessToken='))?.split(';')[0]?.split('=')[1]) || null, res: res };
}
function buildHackathonPayload(overrides = {}) {
    const day = 24 * 60 * 60 * 1e3;
    const now = Date.now();
    return {
        title: `Test Hackathon ${runId}`,
        description:
            'A hackathon created by the automated route tester, description padded to meet the minimum length.',
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
function buildPastDeadlinePayload(overrides = {}) {
    const day = 24 * 60 * 60 * 1e3;
    const now = Date.now();
    return buildHackathonPayload({
        title: `Past Deadline Hackathon ${runId}`,
        registrationStartDate: new Date(now - 10 * day).toISOString(),
        registrationDeadline: new Date(now - 5 * day).toISOString(),
        startDate: new Date(now - 3 * day).toISOString(),
        submissionDeadline: new Date(now - 2 * day).toISOString(),
        endDate: new Date(now - 1 * day).toISOString(),
        ...overrides,
    });
}
async function run() {
    console.log(color.bold(`\nRunning Hackathon API tests against ${color.yellow(BASE_URL)}\n`));
    section('Setup - create test accounts');
    {
        const one = await signup(organizerOne);
        check('Organizer one signup succeeds', one.res.status === 201, `got ${one.res.status}`);
        organizerOneToken = one.token;
        const two = await signup(organizerTwo);
        check('Organizer two signup succeeds', two.res.status === 201, `got ${two.res.status}`);
        organizerTwoToken = two.token;
        const p = await signup(participant);
        check('Participant signup succeeds', p.res.status === 201, `got ${p.res.status}`);
        participantToken = p.token;
    }
    section('1. POST /hackathons - validation');
    {
        const noAuth = await hackathonsApi.post('/', buildHackathonPayload());
        check('Rejects create with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const wrongRole = await hackathonsApi.post('/', buildHackathonPayload(), {
            headers: authHeader(participantToken),
        });
        check(
            'Rejects create from a participant (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const missingFields = await hackathonsApi.post(
            '/',
            { title: 'Too Short Payload' },
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Rejects create with missing required fields (400)',
            missingFields.status === 400,
            `got ${missingFields.status}`
        );
        const badDateOrder = await hackathonsApi.post(
            '/',
            buildHackathonPayload({ endDate: buildHackathonPayload().startDate }),
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Rejects create with invalid date order (400)',
            badDateOrder.status === 400,
            `got ${badDateOrder.status}`
        );
        const offlineNoVenue = await hackathonsApi.post(
            '/',
            buildHackathonPayload({ mode: 'offline' }),
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Rejects offline hackathon with no venue (400)',
            offlineNoVenue.status === 400,
            `got ${offlineNoVenue.status}`
        );
    }
    section('2. POST /hackathons - success');
    {
        const res = await hackathonsApi.post('/', buildHackathonPayload(), {
            headers: authHeader(organizerOneToken),
        });
        check('Create succeeds (201)', res.status === 201, `got ${res.status}`);
        check('Response has success:true', res.data?.success === true);
        check('registrationOpen defaults to false', res.data?.data?.registrationOpen === false);
        check('resultsPublished defaults to false', res.data?.data?.resultsPublished === false);
        hackathonId = res.data?.data?._id || res.data?.data?.id;
        check('Hackathon id captured', !!hackathonId);
        const pastRes = await hackathonsApi.post('/', buildPastDeadlinePayload(), {
            headers: authHeader(organizerOneToken),
        });
        check(
            'Create with past-but-ordered dates succeeds (201)',
            pastRes.status === 201,
            `got ${pastRes.status}`
        );
        pastDeadlineHackathonId = pastRes.data?.data?._id || pastRes.data?.data?.id;
    }
    section('3. GET /hackathons - list, search, filter');
    {
        const listRes = await hackathonsApi.get('/');
        check('List returns 200 with no auth', listRes.status === 200, `got ${listRes.status}`);
        check(
            'Response includes pagination metadata',
            listRes.data?.data?.pagination?.totalHackathons !== undefined
        );
        const searchRes = await hackathonsApi.get('/', { params: { search: 'Automation' } });
        const hackathons = searchRes.data?.data?.hackathons ?? [];
        const found = hackathons.some((h) => h.theme === 'Automation');
        check('Search by theme finds the test hackathon', found);
        const modeRes = await hackathonsApi.get('/', { params: { mode: 'online' } });
        check('Mode filter returns 200', modeRes.status === 200, `got ${modeRes.status}`);
        const badMode = await hackathonsApi.get('/', { params: { mode: 'hybrid' } });
        check(
            'Invalid mode filter is rejected (400)',
            badMode.status === 400,
            `got ${badMode.status}`
        );
        const badLimit = await hackathonsApi.get('/', { params: { limit: 500 } });
        check(
            'Out of range limit is rejected (400)',
            badLimit.status === 400,
            `got ${badLimit.status}`
        );
    }
    section('4. GET /hackathons/:id');
    {
        const res = await hackathonsApi.get(`/${hackathonId}`);
        check('Returns 200 for a real id', res.status === 200, `got ${res.status}`);
        check('Returns the correct title', res.data?.data?.title === buildHackathonPayload().title);
        const badId = await hackathonsApi.get('/not-a-valid-id');
        check('Invalid id format is rejected (400)', badId.status === 400, `got ${badId.status}`);
        const fakeId = await hackathonsApi.get('/64b64b64b64b64b64b64b64b');
        check(
            'Well formed but nonexistent id returns 404',
            fakeId.status === 404,
            `got ${fakeId.status}`
        );
    }
    section('5. GET /hackathons/my');
    {
        const noAuth = await hackathonsApi.get('/my');
        check('Rejects request with no token (401)', noAuth.status === 401, `got ${noAuth.status}`);
        const res = await hackathonsApi.get('/my', { headers: authHeader(organizerOneToken) });
        check('Returns 200 for organizer one', res.status === 200, `got ${res.status}`);
        const onlyOwn = res.data?.data?.hackathons?.every(
            (h) => h.organizer === organizerOneToken || true
        );
        const containsCreated = res.data?.data?.hackathons?.some((h) => h._id === hackathonId);
        check('List includes the hackathon just created', containsCreated === true);
        const otherOrganizerRes = await hackathonsApi.get('/my', {
            headers: authHeader(organizerTwoToken),
        });
        const leaksOther = otherOrganizerRes.data?.data?.hackathons?.some(
            (h) => h._id === hackathonId
        );
        check(
            'Organizer two does not see organizer one hackathon in their own list',
            leaksOther === false
        );
    }
    section('6. PUT /hackathons/:id - edit');
    {
        const notOwner = await hackathonsApi.put(
            `/${hackathonId}`,
            { title: 'Hijacked Title' },
            { headers: authHeader(organizerTwoToken) }
        );
        check(
            'Non-owner organizer cannot edit (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const protectedFields = await hackathonsApi.put(
            `/${hackathonId}`,
            { registrationOpen: true },
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Cannot set registrationOpen directly through edit (400)',
            protectedFields.status === 400,
            `got ${protectedFields.status}`
        );
        const res = await hackathonsApi.put(
            `/${hackathonId}`,
            { prizePool: 5e3 },
            { headers: authHeader(organizerOneToken) }
        );
        check('Owner edit succeeds (200)', res.status === 200, `got ${res.status}`);
        check('prizePool was updated', res.data?.data?.prizePool === 5e3);
    }
    section('7. Registration open and close');
    {
        const openRes = await hackathonsApi.patch(
            `/${hackathonId}/open-registration`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check('Open registration succeeds (200)', openRes.status === 200, `got ${openRes.status}`);
        check('registrationOpen is true', openRes.data?.data?.registrationOpen === true);
        const openAgain = await hackathonsApi.patch(
            `/${hackathonId}/open-registration`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Opening again is rejected (400)',
            openAgain.status === 400,
            `got ${openAgain.status}`
        );
        const pastDeadlineOpen = await hackathonsApi.patch(
            `/${pastDeadlineHackathonId}/open-registration`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Opening past its own deadline is rejected (400)',
            pastDeadlineOpen.status === 400,
            `got ${pastDeadlineOpen.status}`
        );
        const closeRes = await hackathonsApi.patch(
            `/${hackathonId}/close-registration`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Close registration succeeds (200)',
            closeRes.status === 200,
            `got ${closeRes.status}`
        );
        check('registrationOpen is false', closeRes.data?.data?.registrationOpen === false);
        const closeAgain = await hackathonsApi.patch(
            `/${hackathonId}/close-registration`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Closing again is rejected (400)',
            closeAgain.status === 400,
            `got ${closeAgain.status}`
        );
    }
    section('8. PUT /hackathons/:id/banner');
    {
        const form = new FormData();
        form.append('banner', Buffer.from(TEST_PNG_BASE64, 'base64'), {
            filename: 'test-banner.png',
            contentType: 'image/png',
        });
        const noFile = await hackathonsApi.put(
            `/${hackathonId}/banner`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check(
            'Rejects banner update with no file (400)',
            noFile.status === 400,
            `got ${noFile.status}`
        );
        const res = await hackathonsApi.put(`/${hackathonId}/banner`, form, {
            headers: { ...form.getHeaders(), ...authHeader(organizerOneToken) },
        });
        check('Banner upload succeeds (200)', res.status === 200, `got ${res.status}`);
        check(
            'Response includes a new banner URL',
            typeof res.data?.data?.banner === 'string' && res.data.data.banner.length > 0
        );
    }
    section('9. PATCH /hackathons/:id/publish-results');
    {
        const notOwner = await hackathonsApi.patch(
            `/${hackathonId}/publish-results`,
            {},
            { headers: authHeader(organizerTwoToken) }
        );
        check(
            'Non-owner cannot publish results (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const res = await hackathonsApi.patch(
            `/${hackathonId}/publish-results`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check('Publish results succeeds (200)', res.status === 200, `got ${res.status}`);
        check('resultsPublished is true', res.data?.data?.resultsPublished === true);
        const again = await hackathonsApi.patch(
            `/${hackathonId}/publish-results`,
            {},
            { headers: authHeader(organizerOneToken) }
        );
        check('Publishing again is rejected (400)', again.status === 400, `got ${again.status}`);
    }
    section('10. DELETE /hackathons/:id');
    {
        const notOwner = await hackathonsApi.delete(`/${hackathonId}`, {
            headers: authHeader(organizerTwoToken),
        });
        check(
            'Non-owner organizer cannot delete (403)',
            notOwner.status === 403,
            `got ${notOwner.status}`
        );
        const wrongRole = await hackathonsApi.delete(`/${hackathonId}`, {
            headers: authHeader(participantToken),
        });
        check(
            'Participant cannot delete (403)',
            wrongRole.status === 403,
            `got ${wrongRole.status}`
        );
        const res = await hackathonsApi.delete(`/${hackathonId}`, {
            headers: authHeader(organizerOneToken),
        });
        check('Owner delete succeeds (200)', res.status === 200, `got ${res.status}`);
        const getAfterDelete = await hackathonsApi.get(`/${hackathonId}`);
        check(
            'Hackathon no longer exists after delete (404)',
            getAfterDelete.status === 404,
            `got ${getAfterDelete.status}`
        );
    }
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log(
            color.yellow(
                '\nSkipping admin-delete test - set ADMIN_EMAIL and ADMIN_PASSWORD to run it.'
            )
        );
    } else {
        section('11. DELETE /hackathons/:id - admin override');
        const adminLogin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
        adminToken = adminLogin.token;
        check(
            'Admin login succeeds',
            adminLogin.res.status === 200,
            `got ${adminLogin.res.status}`
        );
        if (adminToken) {
            const res = await hackathonsApi.delete(`/${pastDeadlineHackathonId}`, {
                headers: authHeader(adminToken),
            });
            check('Admin can delete any hackathon (200)', res.status === 200, `got ${res.status}`);
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
