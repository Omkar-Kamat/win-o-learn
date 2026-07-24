import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedHackathon } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';
import JudgeAssignment from '../../models/JudgeAssignment.model.js';

let users, tokens, hackathon;

beforeEach(async () => {
  await clearDatabase();
  const seed = await seedUsers();
  users = seed.users;
  tokens = seed.tokens;
  hackathon = await seedHackathon(users.organizer._id);
});

describe('7. Judge Assignment Module (/api/hackathons/:hackathonId/judges*)', () => {

  describe('POST /api/hackathons/:hackathonId/judges', () => {
    it('Organizer-owner successfully assigns an existing judge-role user to their hackathon', async () => {
      const res = await logged('post', `/api/hackathons/${hackathon._id}/judges`, {
        suite: 'Judge Assignment > Assign',
        caseName: 'Organizer-owner successfully assigns an existing judge-role user',
        token: tokens.organizer,
        body: { judgeId: users.judge._id }
      });
      expect(res.status).toBe(201);
    });

    it('Rejects when the target user role is not judge', async () => {
      const res = await logged('post', `/api/hackathons/${hackathon._id}/judges`, {
        suite: 'Judge Assignment > Assign',
        caseName: 'Rejects when the target user role is not judge',
        token: tokens.organizer,
        body: { judgeId: users.participant._id }
      });
      expect(res.status).toBe(400);
    });

    it('Rejects when the judge is already assigned to the hackathon', async () => {
      await JudgeAssignment.create({ hackathon: hackathon._id, judge: users.judge._id, assignedBy: users.organizer._id });

      const res = await logged('post', `/api/hackathons/${hackathon._id}/judges`, {
        suite: 'Judge Assignment > Assign',
        caseName: 'Rejects when the judge is already assigned to the hackathon',
        token: tokens.organizer,
        body: { judgeId: users.judge._id }
      });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/hackathons/:hackathonId/judges/:judgeId', () => {
    it('Organizer-owner successfully removes an assigned judge', async () => {
      await JudgeAssignment.create({ hackathon: hackathon._id, judge: users.judge._id, assignedBy: users.organizer._id });

      const res = await logged('delete', `/api/hackathons/${hackathon._id}/judges/${users.judge._id}`, {
        suite: 'Judge Assignment > Remove',
        caseName: 'Organizer-owner successfully removes an assigned judge',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/hackathons/:hackathonId/judges', () => {
    it('Organizer-owner or admin successfully lists all judges assigned to a hackathon', async () => {
      await JudgeAssignment.create({ hackathon: hackathon._id, judge: users.judge._id, assignedBy: users.organizer._id });

      const res = await logged('get', `/api/hackathons/${hackathon._id}/judges`, {
        suite: 'Judge Assignment > Hackathon Judges List',
        caseName: 'Organizer-owner or admin successfully lists all judges assigned to a hackathon',
        token: tokens.admin
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/judges/me/assigned-hackathons', () => {
    it('Judge successfully lists all hackathons they are assigned to', async () => {
      await JudgeAssignment.create({ hackathon: hackathon._id, judge: users.judge._id, assignedBy: users.organizer._id });

      const res = await logged('get', `/api/judges/me/assigned-hackathons`, {
        suite: 'Judge Assignment > My Hackathons',
        caseName: 'Judge successfully lists all hackathons they are assigned to',
        token: tokens.judge
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
