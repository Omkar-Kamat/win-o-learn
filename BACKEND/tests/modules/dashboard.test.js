import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedHackathon, seedTeam, seedRegistration, seedSubmission } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';
import JudgeAssignment from '../../models/JudgeAssignment.model.js';

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

describe('10. Dashboard Module (/api/dashboard)', () => {

  describe('GET /api/dashboard/admin', () => {
    it('Admin successfully retrieves platform-wide totals', async () => {
      const res = await logged('get', `/api/dashboard/admin`, {
        suite: 'Dashboard > Admin',
        caseName: 'Admin successfully retrieves platform-wide totals',
        token: tokens.admin
      });
      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeDefined();
    });

    it('Rejects non-admin roles', async () => {
      const res = await logged('get', `/api/dashboard/admin`, {
        suite: 'Dashboard > Admin',
        caseName: 'Rejects non-admin roles',
        token: tokens.participant
      });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/organizer', () => {
    it('Organizer successfully retrieves counts scoped to their own hackathons', async () => {
      const res = await logged('get', `/api/dashboard/organizer`, {
        suite: 'Dashboard > Organizer',
        caseName: 'Organizer successfully retrieves counts scoped to their own hackathons',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
      expect(res.body.data.myHackathons).toBeDefined();
    });
  });

  describe('GET /api/dashboard/participant', () => {
    it('Participant successfully retrieves their registered hackathon count, team list', async () => {
      const res = await logged('get', `/api/dashboard/participant`, {
        suite: 'Dashboard > Participant',
        caseName: 'Participant successfully retrieves their registered hackathon count, team list',
        token: tokens.participant
      });
      expect(res.status).toBe(200);
      expect(res.body.data.teams).toBeDefined();
    });
  });

  describe('GET /api/dashboard/judge', () => {
    it('Judge successfully retrieves assigned hackathon count, assigned project count', async () => {
      const res = await logged('get', `/api/dashboard/judge`, {
        suite: 'Dashboard > Judge',
        caseName: 'Judge successfully retrieves assigned hackathon count, assigned project count',
        token: tokens.judge
      });
      expect(res.status).toBe(200);
      expect(res.body.data.assignedHackathons).toBeDefined();
    });
  });

});
