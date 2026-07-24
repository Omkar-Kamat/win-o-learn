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
    name: 'Review Org A',
    email: `rev.orga.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const organizerB = {
    name: 'Review Org B',
    email: `rev.orgb.${runId}@example.com`,
    password: 'Password123',
    role: 'organizer',
};
const judgeOne = {
    name: 'Review Judge 1',
    email: `rev.j1.${runId}@example.com`,
    password: 'Password123',
    role: 'judge',
};
const judgeTwo = {
    name: 'Review Judge 2',
    email: `rev.j2.${runId}@example.com`,
    password: 'Password123',
    role: 'judge',
};
const judgeThree = {
    name: 'Review Judge 3',
    email: `rev.j3.${runId}@example.com`,
    password: 'Password123',
    role: 'judge',
};
const participantUser = {
    name: 'Review Participant',
    email: `rev.part.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
const outsiderUser = {
    name: 'Review Outsider',
    email: `rev.out.${runId}@example.com`,
    password: 'Password123',
    role: 'participant',
};
let orgAToken, orgBToken, j1Token, j1Id, j2Token, j2Id, j3Token, j3Id;
let partToken, partId, outToken, outId, adminToken;
let hackathonId, teamId, registrationId, submissionId, review1Id, review2Id;
let firstReviewResponse = null;
const api = (path) => axios.create({ baseURL: `${BASE_URL}${path}`, validateStatus: () => true });
const authApi = api('/auth');
const hackathonsApi = api('/hackathons');
const teamsApi = api('/teams');
const submissionsApi = api('/submissions');
const judgesApi = api('/judges');
const reviewsApi = api('');
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
    return {
        token: (res.headers['set-cookie']?.find(c => c.startsWith('accessToken='))?.split(';')[0]?.split('=')[1]) || null,
        id: res.data?.data?.user?._id || res.data?.data?.user?.id || null,
        res: res,
    };
}
async function run() {
    console.log(color.bold(`\nRunning Reviews API tests against ${color.yellow(BASE_URL)}\n`));
    section('Setup - create test accounts');
    {
        const oA = await signup(organizerA);
        check('Organizer signup', oA.res.status === 201);
        orgAToken = oA.token;
        const oB = await signup(organizerB);
        check('Organizer B signup', oB.res.status === 201);
        orgBToken = oB.token;
        const j1 = await signup(judgeOne);
        check('Judge One signup', j1.res.status === 201);
        j1Token = j1.token;
        j1Id = j1.id;
        const j2 = await signup(judgeTwo);
        check('Judge Two signup', j2.res.status === 201);
        j2Token = j2.token;
        j2Id = j2.id;
        const j3 = await signup(judgeThree);
        check('Judge Three (unassigned) signup', j3.res.status === 201);
        j3Token = j3.token;
        j3Id = j3.id;
        const p = await signup(participantUser);
        check('Participant signup', p.res.status === 201);
        partToken = p.token;
        partId = p.id;
        const out = await signup(outsiderUser);
        check('Outsider signup', out.res.status === 201);
        outToken = out.token;
        outId = out.id;
        if (ADMIN_EMAIL && ADMIN_PASSWORD) {
            const adminLogin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
            adminToken = adminLogin.token;
        }
    }
    section('Setup - create hackathon');
    {
        const now = Date.now();
        const hRes = await hackathonsApi.post(
            '/',
            {
                title: 'Review Test Hackathon',
                description: 'A hackathon to test reviews',
                theme: 'Testing',
                mode: 'online',
                registrationStartDate: new Date(now - 864e5).toISOString(),
                registrationDeadline: new Date(now + 864e5).toISOString(),
                startDate: new Date(now + 864e5 * 2).toISOString(),
                submissionDeadline: new Date(now + 864e5 * 3).toISOString(),
                endDate: new Date(now + 864e5 * 4).toISOString(),
                prizePool: 1e3,
                maxTeamSize: 4,
                rules: ['Rule 1'],
                judgingCriteria: [
                    { criterion: 'Innovation', maxMarks: 50 },
                    { criterion: 'Execution', maxMarks: 50 },
                ],
            },
            { headers: authHeader(orgAToken) }
        );
        check('Organizer creates hackathon', hRes.status === 201);
        hackathonId = hRes.data?.data?._id || hRes.data?.data?.id;
        const openRes = await hackathonsApi.patch(
            `/${hackathonId}/open-registration`,
            {},
            { headers: authHeader(orgAToken) }
        );
        check('Registration opened', openRes.status === 200);
        check('Judging criteria created', hRes.data?.data?.judgingCriteria?.length === 2);
    }
    section('Setup - assign judges');
    {
        const a1 = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: j1Id },
            { headers: authHeader(orgAToken) }
        );
        check('Assign Judge One', [200, 201].includes(a1.status));
        const a2 = await hackathonsApi.post(
            `/${hackathonId}/judges`,
            { judgeId: j2Id },
            { headers: authHeader(orgAToken) }
        );
        check('Assign Judge Two', [200, 201].includes(a2.status));
    }
    section('Setup - create approved submission');
    {
        const tRes = await teamsApi.post(
            '/',
            { name: 'Review Team' },
            { headers: authHeader(partToken) }
        );
        check('Team created', tRes.status === 201);
        teamId = tRes.data?.data?._id || tRes.data?.data?.id;
        const rRes = await hackathonsApi.post(
            `/${hackathonId}/register`,
            { teamId: teamId },
            { headers: authHeader(partToken) }
        );
        check('Registration created', rRes.status === 201);
        registrationId = rRes.data?.data?._id || rRes.data?.data?.id;
        const appRes = await api('').patch(
            `/registrations/${registrationId}/approve`,
            {},
            { headers: authHeader(orgAToken) }
        );
        check('Registration approved', appRes.status === 200);
        const sRes = await hackathonsApi.post(
            `/${hackathonId}/submissions`,
            {
                projectName: 'Review Project',
                problemStatement: 'Problem',
                solutionDescription: 'Solution',
            },
            { headers: authHeader(partToken) }
        );
        check('Submission created', sRes.status === 201);
        submissionId = sRes.data?.data?._id || sRes.data?.data?.id;
    }
    section('1. POST /submissions/:submissionId/reviews - Validation');
    {
        const noToken = await reviewsApi.post(`/submissions/${submissionId}/reviews`, {
            scores: [],
        });
        check(
            'Authentication - Reject request with no token (401)',
            noToken.status === 401,
            `got ${noToken.status}`
        );
        const asPart = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            { scores: [] },
            { headers: authHeader(partToken) }
        );
        check(
            'Authorization - Participant cannot review (403)',
            asPart.status === 403,
            `got ${asPart.status}`
        );
        const asOrg = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            { scores: [] },
            { headers: authHeader(orgAToken) }
        );
        check(
            'Authorization - Organizer cannot review (403)',
            asOrg.status === 403,
            `got ${asOrg.status}`
        );
        if (adminToken) {
            const asAdmin = await reviewsApi.post(
                `/submissions/${submissionId}/reviews`,
                { scores: [] },
                { headers: authHeader(adminToken) }
            );
            check(
                'Authorization - Admin cannot review (403)',
                asAdmin.status === 403,
                `got ${asAdmin.status}`
            );
        } else {
            console.log(`  ${color.yellow('SKIP')}  Authorization - Admin cannot review (403)`);
        }
        const asUnassigned = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            { scores: [] },
            { headers: authHeader(j3Token) }
        );
        check(
            'Authorization - Unassigned judge cannot review (403)',
            asUnassigned.status === 403,
            `got ${asUnassigned.status}`
        );
        const badId = await reviewsApi.post(
            `/submissions/invalid-id/reviews`,
            { scores: [] },
            { headers: authHeader(j1Token) }
        );
        check(
            'Invalid submission - Invalid submission id → 400',
            badId.status === 400,
            `got ${badId.status}`
        );
        const noSub = await reviewsApi.post(
            `/submissions/64b64b64b64b64b64b64b64b/reviews`,
            { scores: [] },
            { headers: authHeader(j1Token) }
        );
        check(
            'Invalid submission - Non-existent submission → 404',
            noSub.status === 404,
            `got ${noSub.status}`
        );
        const missScores = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {},
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Missing scores → 400',
            missScores.status === 400,
            `got ${missScores.status}`
        );
        const emptyScores = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            { scores: [] },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Empty scores array → 400',
            emptyScores.status === 400,
            `got ${emptyScores.status}`
        );
        const unknownCrit = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Unknown', score: 10 },
                    { criterion: 'Execution', score: 10 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Unknown judging criterion → 400',
            unknownCrit.status === 400,
            `got ${unknownCrit.status}`
        );
        const dupCrit = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: 10 },
                    { criterion: 'Innovation', score: 10 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Duplicate criterion → 400',
            dupCrit.status === 400,
            `got ${dupCrit.status}`
        );
        const missCrit = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            { scores: [{ criterion: 'Innovation', score: 10 }] },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Missing required criterion → 400',
            missCrit.status === 400,
            `got ${missCrit.status}`
        );
        const belowZero = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: -5 },
                    { criterion: 'Execution', score: 10 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Marks below 0 → 400',
            belowZero.status === 400,
            `got ${belowZero.status}`
        );
        const aboveMax = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: 60 },
                    { criterion: 'Execution', score: 10 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Marks greater than maxMarks → 400',
            aboveMax.status === 400,
            `got ${aboveMax.status}`
        );
        const badType = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: 'ten' },
                    { criterion: 'Execution', score: 10 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Invalid score datatype → 400',
            badType.status === 400,
            `got ${badType.status}`
        );
        const succRev = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: 40 },
                    { criterion: 'Execution', score: 35 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        firstReviewResponse = succRev;
        check(
            'Success - Judge One submits review → 201',
            succRev.status === 201,
            `got ${succRev.status}`
        );
        review1Id = succRev.data?.data?._id || succRev.data?.data?.id;
        check('Success - reviewId captured', !!review1Id);
        check('Success - totalScore calculated correctly', succRev.data?.data?.totalScore === 75);
        check('Validation - Missing feedback (should succeed)', !succRev.data?.data?.feedback);
        const dupRev = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: 40 },
                    { criterion: 'Execution', score: 35 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Duplicate review - Same judge reviews same submission twice → 409',
            dupRev.status === 409,
            `got ${dupRev.status}`
        );
        const checkStats = await submissionsApi.get(`/${submissionId}`, {
            headers: authHeader(orgAToken),
        });
        check(
            'Success - averageScore updated',
            checkStats.data?.data?.averageScore === 75,
            `got ${checkStats.data?.data?.averageScore}`
        );
        check(
            'Success - reviewCount updated',
            checkStats.data?.data?.reviewCount === 1,
            `got ${checkStats.data?.data?.reviewCount}`
        );
    }
    section('2. PUT /reviews/:reviewId');
    {
        const noToken = await reviewsApi.put(`/reviews/${review1Id}`, {});
        check(
            'Authentication - Reject without token (401)',
            noToken.status === 401,
            `got ${noToken.status}`
        );
        const asOrg = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {},
            { headers: authHeader(orgAToken) }
        );
        check(
            'Authorization - Organizer cannot edit review (403)',
            asOrg.status === 403,
            `got ${asOrg.status}`
        );
        const asPart = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {},
            { headers: authHeader(partToken) }
        );
        check(
            'Authorization - Participant cannot edit review (403)',
            asPart.status === 403,
            `got ${asPart.status}`
        );
        const asJ2 = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {},
            { headers: authHeader(j2Token) }
        );
        check(
            "Authorization - Judge Two cannot edit Judge One's review (403)",
            asJ2.status === 403,
            `got ${asJ2.status}`
        );
        const badId = await reviewsApi.put(
            `/reviews/invalid-id`,
            {},
            { headers: authHeader(j1Token) }
        );
        check('Validation - Invalid review id → 400', badId.status === 400, `got ${badId.status}`);
        const noRev = await reviewsApi.put(
            `/reviews/64b64b64b64b64b64b64b64b`,
            {},
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Non-existent review → 404',
            noRev.status === 404,
            `got ${noRev.status}`
        );
        const badCrit = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {
                scores: [
                    { criterion: 'Unknown', score: 45 },
                    { criterion: 'Execution', score: 40 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Invalid criterion → 400',
            badCrit.status === 400,
            `got ${badCrit.status}`
        );
        const missCrit = await reviewsApi.put(
            `/reviews/${review1Id}`,
            { scores: [{ criterion: 'Innovation', score: 45 }] },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Missing criterion → 400',
            missCrit.status === 400,
            `got ${missCrit.status}`
        );
        const excMax = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {
                scores: [
                    { criterion: 'Innovation', score: 99 },
                    { criterion: 'Execution', score: 40 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Validation - Score exceeds maximum → 400',
            excMax.status === 400,
            `got ${excMax.status}`
        );
        const succUpd = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {
                scores: [
                    { criterion: 'Innovation', score: 45 },
                    { criterion: 'Execution', score: 45 },
                ],
                feedback: 'Much better',
            },
            { headers: authHeader(j1Token) }
        );
        check(
            'Success - Judge updates own review → 200',
            succUpd.status === 200,
            `got ${succUpd.status}`
        );
        check('Success - totalScore recalculated', succUpd.data?.data?.totalScore === 90);
        const checkStats = await submissionsApi.get(`/${submissionId}`, {
            headers: authHeader(orgAToken),
        });
        check('Success - averageScore recalculated', checkStats.data?.data?.averageScore === 90);
    }
    section('3. GET /reviews/:reviewId');
    {
        const noToken = await reviewsApi.get(`/reviews/${review1Id}`);
        check('Authentication - No token → 401', noToken.status === 401, `got ${noToken.status}`);
        const asJ1 = await reviewsApi.get(`/reviews/${review1Id}`, {
            headers: authHeader(j1Token),
        });
        check('Authorization - Assigned judge can view', asJ1.status === 200, `got ${asJ1.status}`);
        const asOrg = await reviewsApi.get(`/reviews/${review1Id}`, {
            headers: authHeader(orgAToken),
        });
        check('Authorization - Organizer can view', asOrg.status === 200, `got ${asOrg.status}`);
        if (adminToken) {
            const asAdmin = await reviewsApi.get(`/reviews/${review1Id}`, {
                headers: authHeader(adminToken),
            });
            check(
                'Authorization - Admin can view',
                asAdmin.status === 200,
                `got ${asAdmin.status}`
            );
        } else {
            console.log(`  ${color.yellow('SKIP')}  Authorization - Admin can view`);
        }
        const asPart = await reviewsApi.get(`/reviews/${review1Id}`, {
            headers: authHeader(partToken),
        });
        check(
            'Authorization - Participant cannot view',
            asPart.status === 403,
            `got ${asPart.status}`
        );
        const asUnassigned = await reviewsApi.get(`/reviews/${review1Id}`, {
            headers: authHeader(j3Token),
        });
        check(
            'Authorization - Unassigned judge cannot view',
            asUnassigned.status === 403,
            `got ${asUnassigned.status}`
        );
        const badId = await reviewsApi.get(`/reviews/invalid-id`, {
            headers: authHeader(orgAToken),
        });
        check('Validation - Invalid review id → 400', badId.status === 400, `got ${badId.status}`);
        const noRev = await reviewsApi.get(`/reviews/64b64b64b64b64b64b64b64b`, {
            headers: authHeader(orgAToken),
        });
        check('Validation - Unknown review → 404', noRev.status === 404, `got ${noRev.status}`);
        check('Success - Returns review', !!asJ1.data?.data?._id || !!asJ1.data?.data?.id);
        check('Success - Returns judge', !!asJ1.data?.data?.judge);
        check('Success - Returns submission', !!asJ1.data?.data?.submission);
        check(
            'Success - Returns scores',
            Array.isArray(asJ1.data?.data?.scores) && asJ1.data?.data?.scores?.length > 0
        );
        check('Success - Returns feedback', asJ1.data?.data?.feedback === 'Much better');
    }
    const rev2Res = await reviewsApi.post(
        `/submissions/${submissionId}/reviews`,
        {
            scores: [
                { criterion: 'Innovation', score: 30 },
                { criterion: 'Execution', score: 30 },
            ],
        },
        { headers: authHeader(j2Token) }
    );
    review2Id = rev2Res.data?.data?._id || rev2Res.data?.data?.id;
    section('4. GET /submissions/:submissionId/reviews');
    {
        const noToken = await reviewsApi.get(`/submissions/${submissionId}/reviews`);
        check('Authentication - No token (401)', noToken.status === 401, `got ${noToken.status}`);
        const asOrg = await reviewsApi.get(`/submissions/${submissionId}/reviews`, {
            headers: authHeader(orgAToken),
        });
        check('Authorization - Organizer', asOrg.status === 200, `got ${asOrg.status}`);
        const asJudge = await reviewsApi.get(`/submissions/${submissionId}/reviews`, {
            headers: authHeader(j1Token),
        });
        check('Authorization - Assigned Judge', asJudge.status === 200, `got ${asJudge.status}`);
        if (adminToken) {
            const asAdmin = await reviewsApi.get(`/submissions/${submissionId}/reviews`, {
                headers: authHeader(adminToken),
            });
            check('Authorization - Admin', asAdmin.status === 200, `got ${asAdmin.status}`);
        } else {
            console.log(`  ${color.yellow('SKIP')}  Authorization - Admin`);
        }
        const asPart = await reviewsApi.get(`/submissions/${submissionId}/reviews`, {
            headers: authHeader(partToken),
        });
        check(
            'Authorization - Participant rejected',
            asPart.status === 403,
            `got ${asPart.status}`
        );
        const asUnassigned = await reviewsApi.get(`/submissions/${submissionId}/reviews`, {
            headers: authHeader(j3Token),
        });
        check(
            'Authorization - Unassigned Judge rejected',
            asUnassigned.status === 403,
            `got ${asUnassigned.status}`
        );
        const badId = await reviewsApi.get(`/submissions/invalid-id/reviews`, {
            headers: authHeader(orgAToken),
        });
        check('Validation - Invalid submission id', badId.status === 400, `got ${badId.status}`);
        const noSub = await reviewsApi.get(`/submissions/64b64b64b64b64b64b64b64b/reviews`, {
            headers: authHeader(orgAToken),
        });
        check('Validation - Unknown submission', noSub.status === 404, `got ${noSub.status}`);
        check('Success - Returns array', Array.isArray(asOrg.data?.data));
        check('Success - Correct review count', asOrg.data?.data?.length === 2);
        check(
            'Success - Includes Judge One review',
            asOrg.data?.data?.some((r) => r._id === review1Id || r.id === review1Id)
        );
        check(
            'Success - Includes Judge Two review',
            asOrg.data?.data?.some((r) => r._id === review2Id || r.id === review2Id)
        );
    }
    section('5. GET /hackathons/:hackathonId/reviews');
    {
        const noToken = await reviewsApi.get(`/hackathons/${hackathonId}/reviews`);
        check('Authentication - No token (401)', noToken.status === 401, `got ${noToken.status}`);
        const asOrg = await reviewsApi.get(`/hackathons/${hackathonId}/reviews`, {
            headers: authHeader(orgAToken),
        });
        check('Authorization - Organizer allowed', asOrg.status === 200, `got ${asOrg.status}`);
        if (adminToken) {
            const asAdmin = await reviewsApi.get(`/hackathons/${hackathonId}/reviews`, {
                headers: authHeader(adminToken),
            });
            check('Authorization - Admin allowed', asAdmin.status === 200, `got ${asAdmin.status}`);
        } else {
            console.log(`  ${color.yellow('SKIP')}  Authorization - Admin allowed`);
        }
        const asJudge = await reviewsApi.get(`/hackathons/${hackathonId}/reviews`, {
            headers: authHeader(j1Token),
        });
        check('Authorization - Judge denied', asJudge.status === 403, `got ${asJudge.status}`);
        const asPart = await reviewsApi.get(`/hackathons/${hackathonId}/reviews`, {
            headers: authHeader(partToken),
        });
        check('Authorization - Participant denied', asPart.status === 403, `got ${asPart.status}`);
        const asOrgB = await reviewsApi.get(`/hackathons/${hackathonId}/reviews`, {
            headers: authHeader(orgBToken),
        });
        check(
            'Authorization - Other organizer denied',
            asOrgB.status === 403,
            `got ${asOrgB.status}`
        );
        const badId = await reviewsApi.get(`/hackathons/invalid-id/reviews`, {
            headers: authHeader(orgAToken),
        });
        check('Validation - Invalid hackathon id', badId.status === 400, `got ${badId.status}`);
        const noHack = await reviewsApi.get(`/hackathons/64b64b64b64b64b64b64b64b/reviews`, {
            headers: authHeader(orgAToken),
        });
        check('Validation - Unknown hackathon', noHack.status === 404, `got ${noHack.status}`);
        check(
            'Success - Returns every review',
            Array.isArray(asOrg.data?.data) && asOrg.data?.data?.length >= 2
        );
        check(
            'Success - Reviews belong to correct hackathon',
            asOrg.data?.data?.every(
                (r) => (r.hackathon?._id || r.hackathon?.id || r.hackathon) === hackathonId
            )
        );
    }
    section('6. GET /judges/me/reviews');
    {
        const noToken = await reviewsApi.get(`/judges/me/reviews`);
        check('Authentication - No token (401)', noToken.status === 401, `got ${noToken.status}`);
        const asPart = await reviewsApi.get(`/judges/me/reviews`, {
            headers: authHeader(partToken),
        });
        check(
            'Authorization - Participant rejected',
            asPart.status === 403,
            `got ${asPart.status}`
        );
        const asOrg = await reviewsApi.get(`/judges/me/reviews`, {
            headers: authHeader(orgAToken),
        });
        check('Authorization - Organizer rejected', asOrg.status === 403, `got ${asOrg.status}`);
        if (adminToken) {
            const asAdmin = await reviewsApi.get(`/judges/me/reviews`, {
                headers: authHeader(adminToken),
            });
            check(
                'Authorization - Admin rejected',
                asAdmin.status === 403,
                `got ${asAdmin.status}`
            );
        } else {
            console.log(`  ${color.yellow('SKIP')}  Authorization - Admin rejected`);
        }
        const j1Revs = await reviewsApi.get(`/judges/me/reviews`, { headers: authHeader(j1Token) });
        check(
            'Success - Judge One only sees own reviews',
            j1Revs.status === 200 &&
                j1Revs.data?.data?.length === 1 &&
                (j1Revs.data.data[0]._id === review1Id || j1Revs.data.data[0].id === review1Id)
        );
        const j2Revs = await reviewsApi.get(`/judges/me/reviews`, { headers: authHeader(j2Token) });
        check(
            'Success - Judge Two only sees own reviews',
            j2Revs.status === 200 &&
                j2Revs.data?.data?.length === 1 &&
                (j2Revs.data.data[0]._id === review2Id || j2Revs.data.data[0].id === review2Id)
        );
    }
    section('Aggregation Tests');
    {
        const checkStats = await submissionsApi.get(`/${submissionId}`, {
            headers: authHeader(orgAToken),
        });
        check('Second review - reviewCount = 2', checkStats.data?.data?.reviewCount === 2);
        check(
            'Second review - averageScore = average of both',
            checkStats.data?.data?.averageScore === 75,
            `got ${checkStats.data?.data?.averageScore}`
        );
        await reviewsApi.put(
            `/reviews/${review2Id}`,
            {
                scores: [
                    { criterion: 'Innovation', score: 30 },
                    { criterion: 'Execution', score: 40 },
                ],
            },
            { headers: authHeader(j2Token) }
        );
        const checkStats2 = await submissionsApi.get(`/${submissionId}`, {
            headers: authHeader(orgAToken),
        });
        check('Update review - reviewCount unchanged', checkStats2.data?.data?.reviewCount === 2);
        check(
            'Update review - averageScore recalculated',
            checkStats2.data?.data?.averageScore === 80,
            `got ${checkStats2.data?.data?.averageScore}`
        );
    }
    section('Business Rule Tests & Response Validation');
    {
        const j1Dup = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: 10 },
                    { criterion: 'Execution', score: 10 },
                ],
            },
            { headers: authHeader(j1Token) }
        );
        check('Duplicate review prevention - 409', j1Dup.status === 409, `got ${j1Dup.status}`);
        const j2EditsJ1 = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {
                scores: [
                    { criterion: 'Innovation', score: 10 },
                    { criterion: 'Execution', score: 10 },
                ],
            },
            { headers: authHeader(j2Token) }
        );
        check(
            'Ownership - Judge Two edits Judge One review - 403',
            j2EditsJ1.status === 403,
            `got ${j2EditsJ1.status}`
        );
        const j3Creates = await reviewsApi.post(
            `/submissions/${submissionId}/reviews`,
            {
                scores: [
                    { criterion: 'Innovation', score: 10 },
                    { criterion: 'Execution', score: 10 },
                ],
            },
            { headers: authHeader(j3Token) }
        );
        check(
            'Assignment - Judge not assigned reviews submission - 403',
            j3Creates.status === 403,
            `got ${j3Creates.status}`
        );
        const tryFinalize = await reviewsApi.put(
            `/reviews/${review1Id}`,
            {
                scores: [
                    { criterion: 'Innovation', score: 10 },
                    { criterion: 'Execution', score: 10 },
                ],
                isFinal: true,
            },
            { headers: authHeader(j1Token) }
        );
    }
    section('Response Validation');
    {
        const resp = firstReviewResponse;
        check('Returns 201', resp.status === 201);
        check('Returns success: true', resp.data?.success === true);
        check('Returns _id', !!(resp.data?.data?._id || resp.data?.data?.id));
        check('Returns submission', !!resp.data?.data?.submission);
        check('Returns judge', !!resp.data?.data?.judge);
        check('Returns scores', Array.isArray(resp.data?.data?.scores));
        check('Returns totalScore', typeof resp.data?.data?.totalScore === 'number');
        check(
            'Returns feedback',
            resp.data?.data?.feedback === undefined || resp.data?.data?.feedback === ''
        );
        check('Returns createdAt', !!resp.data?.data?.createdAt);
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
