import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedHackathon, seedTeam, seedRegistration, seedSubmission } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';
import JudgeAssignment from '../../models/JudgeAssignment.model.js';
import Review from '../../models/Review.model.js';

let users, tokens, hackathon, team, registration, submission;

beforeEach(async () => {
  await clearDatabase();
  const seed = await seedUsers();
  users = seed.users;
  tokens = seed.tokens;
  hackathon = await seedHackathon(users.organizer._id);
  team = await seedTeam(users.participant._id);
  registration = await seedRegistration(hackathon._id, team._id);
  submission = await seedSubmission(hackathon._id, registration._id);
  await JudgeAssignment.create({ hackathon: hackathon._id, judge: users.judge._id, assignedBy: users.organizer._id });
});

describe('8. Review Module (/api/reviews, /api/submissions/:submissionId/reviews, etc.)', () => {

  describe('POST /api/submissions/:submissionId/reviews', () => {
    it('Assigned judge successfully submits a review with valid scores for every judging criterion', async () => {
      const res = await logged('post', `/api/submissions/${submission._id}/reviews`, {
        suite: 'Review > Create',
        caseName: 'Assigned judge successfully submits a review with valid scores',
        token: tokens.judge,
        body: {
          scores: [
            { criterion: 'Innovation', score: 90 },
            { criterion: 'Execution', score: 80 }
          ],
          feedback: 'Good job!'
        }
      });
      expect(res.status).toBe(201);
      expect(res.body.data.totalScore).toBe(170);
    });

    it('Rejects a judge not assigned to the submissions hackathon', async () => {
      // Unassign judge
      await JudgeAssignment.deleteMany({});
      
      const res = await logged('post', `/api/submissions/${submission._id}/reviews`, {
        suite: 'Review > Create',
        caseName: 'Rejects a judge not assigned to the submissions hackathon',
        token: tokens.judge,
        body: {
          scores: [
            { criterion: 'Innovation', score: 90 },
            { criterion: 'Execution', score: 80 }
          ]
        }
      });
      expect(res.status).toBe(403);
    });

    it('Rejects a judge submitting a second review for the same submission', async () => {
      await Review.create({
        submission: submission._id,
        judge: users.judge._id,
        hackathon: hackathon._id,
        scores: [{ criterion: 'Innovation', score: 90 }, { criterion: 'Execution', score: 80 }],
        totalScore: 170
      });

      const res = await logged('post', `/api/submissions/${submission._id}/reviews`, {
        suite: 'Review > Create',
        caseName: 'Rejects a judge submitting a second review for the same submission',
        token: tokens.judge,
        body: {
          scores: [
            { criterion: 'Innovation', score: 90 },
            { criterion: 'Execution', score: 80 }
          ]
        }
      });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/submissions/:submissionId/reviews', () => {
    it('Admin/hackathon organizer/assigned judge successfully lists all reviews for a submission', async () => {
      const res = await logged('get', `/api/submissions/${submission._id}/reviews`, {
        suite: 'Review > Submission Reviews List',
        caseName: 'Admin/hackathon organizer/assigned judge successfully lists all reviews for a submission',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('Review original judge author successfully updates their own review with valid scores', async () => {
      const review = await Review.create({
        submission: submission._id,
        judge: users.judge._id,
        hackathon: hackathon._id,
        scores: [{ criterion: 'Innovation', score: 90 }, { criterion: 'Execution', score: 80 }],
        totalScore: 170
      });

      const res = await logged('put', `/api/reviews/${review._id}`, {
        suite: 'Review > Update',
        caseName: 'Review original judge author successfully updates their own review with valid scores',
        token: tokens.judge,
        body: {
          scores: [
            { criterion: 'Innovation', score: 100 },
            { criterion: 'Execution', score: 100 }
          ]
        }
      });
      expect(res.status).toBe(200);
    });
  });
});
