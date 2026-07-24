import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedHackathon, seedTeam, seedRegistration, seedSubmission } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';
import Hackathon from '../../models/Hackathon.model.js';

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
});

describe('9. Leaderboard Module (/api/hackathons/:hackathonId/leaderboard*)', () => {

  describe('GET /api/hackathons/:hackathonId/leaderboard', () => {
    it('Rejects access when results have not yet been published', async () => {
      const res = await logged('get', `/api/hackathons/${hackathon._id}/leaderboard`, {
        suite: 'Leaderboard > Get',
        caseName: 'Rejects access when results have not yet been published',
      });
      expect(res.status).toBe(403);
    });

    it('Successfully returns a ranked list once resultsPublished is true', async () => {
      hackathon.resultsPublished = true;
      await hackathon.save();

      const res = await logged('get', `/api/hackathons/${hackathon._id}/leaderboard`, {
        suite: 'Leaderboard > Get',
        caseName: 'Successfully returns a ranked list once resultsPublished is true',
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/hackathons/:hackathonId/leaderboard/recalculate', () => {
    it('Admin or hackathon organizer-owner successfully triggers a recalculation', async () => {
      const res = await logged('get', `/api/hackathons/${hackathon._id}/leaderboard/recalculate`, {
        suite: 'Leaderboard > Recalculate',
        caseName: 'Admin or hackathon organizer-owner successfully triggers a recalculation',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
    });

    it('Rejects a non-owner organizer or non-admin user', async () => {
      const res = await logged('get', `/api/hackathons/${hackathon._id}/leaderboard/recalculate`, {
        suite: 'Leaderboard > Recalculate',
        caseName: 'Rejects a non-owner organizer or non-admin user',
        token: tokens.participant
      });
      expect(res.status).toBe(403);
    });
  });

});
