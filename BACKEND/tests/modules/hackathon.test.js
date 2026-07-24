import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedHackathon } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';
import User from '../../models/User.model.js';
let users, tokens, hackathon;

beforeEach(async () => {
  await clearDatabase();
  const seed = await seedUsers();
  users = seed.users;
  tokens = seed.tokens;
  hackathon = await seedHackathon(users.organizer._id);
});

describe('3. Hackathon Module (/api/hackathons)', () => {

  describe('GET /api/hackathons/', () => {
    it('Returns paginated public list of hackathons with default pagination', async () => {
      const res = await logged('get', '/api/hackathons/', {
        suite: 'Hackathon > Public List',
        caseName: 'Returns paginated public list of hackathons with default pagination'
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.hackathons)).toBe(true);
    });
  });

  describe('POST /api/hackathons/', () => {
    it('Organizer successfully creates a hackathon with all required valid fields', async () => {
      const res = await logged('post', '/api/hackathons/', {
        suite: 'Hackathon > Create',
        caseName: 'Organizer successfully creates a hackathon with all required valid fields',
        token: tokens.organizer,
        body: {
          title: 'New Hackathon',
          description: 'This is a test hackathon description that is at least 20 chars long.',
          theme: 'AI',
          mode: 'online',
          registrationStartDate: new Date(Date.now() - 86400000),
          registrationDeadline: new Date(Date.now() + 86400000),
          startDate: new Date(Date.now() + 86400000 * 2),
          submissionDeadline: new Date(Date.now() + 86400000 * 3),
          endDate: new Date(Date.now() + 86400000 * 4),
          prizePool: 1000,
          maxTeamSize: 4,
          rules: ['Rule 1'],
          judgingCriteria: [{ criterion: 'Innovation', maxMarks: 100 }]
        }
      });
      expect(res.status).toBe(201);
    });

    it('Rejects non-organizer roles', async () => {
      const res = await logged('post', '/api/hackathons/', {
        suite: 'Hackathon > Create',
        caseName: 'Rejects non-organizer roles',
        token: tokens.participant,
        body: { title: 'Invalid' }
      });
      expect(res.status).toBe(403);
    });

    it('Rejects invalid mode (must be online/offline)', async () => {
      const res = await logged('post', '/api/hackathons/', {
        suite: 'Hackathon > Create',
        caseName: 'Rejects invalid mode',
        token: tokens.organizer,
        body: {
          title: 'New Hackathon',
          description: 'This is a test hackathon description that is at least 20 chars long.',
          theme: 'AI',
          mode: 'hybrid', // invalid
          registrationStartDate: new Date(Date.now() - 86400000),
          registrationDeadline: new Date(Date.now() + 86400000),
          startDate: new Date(Date.now() + 86400000 * 2),
          submissionDeadline: new Date(Date.now() + 86400000 * 3),
          endDate: new Date(Date.now() + 86400000 * 4),
          prizePool: 1000,
          maxTeamSize: 4,
          judgingCriteria: [{ name: 'Innovation', maxMarks: 100 }]
        }
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/hackathons/:id', () => {
    it('Successfully fetches a hackathon by valid ID', async () => {
      const res = await logged('get', `/api/hackathons/${hackathon._id}`, {
        suite: 'Hackathon > Get By ID',
        caseName: 'Successfully fetches a hackathon by valid ID'
      });
      expect(res.status).toBe(200);
    });

    it('Returns not found for non-existent hackathon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await logged('get', `/api/hackathons/${fakeId}`, {
        suite: 'Hackathon > Get By ID',
        caseName: 'Returns not found for non-existent hackathon'
      });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/hackathons/:id', () => {
    it('Organizer-owner successfully updates allowed fields', async () => {
      const res = await logged('put', `/api/hackathons/${hackathon._id}`, {
        suite: 'Hackathon > Update',
        caseName: 'Organizer-owner successfully updates allowed fields',
        token: tokens.organizer,
        body: { title: 'Updated Title' }
      });
      expect(res.status).toBe(200);
    });

    it('Rejects organizer who does not own the hackathon', async () => {
      const otherOrg = await User.create({ name: 'Org 2', email: 'org2@test.com', password: 'Password1!', role: 'organizer' });
      const otherOrgToken = await (await import('../../utils/GenerateToken.js')).generateAccessToken(otherOrg);
      
      const res = await logged('put', `/api/hackathons/${hackathon._id}`, {
        suite: 'Hackathon > Update',
        caseName: 'Rejects organizer who does not own the hackathon',
        token: otherOrgToken,
        body: { title: 'Hacked' }
      });
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/hackathons/:id/open-registration', () => {
    it('Rejects when registration is already open', async () => {
      const res = await logged('patch', `/api/hackathons/${hackathon._id}/open-registration`, {
        suite: 'Hackathon > Open Registration',
        caseName: 'Rejects when registration is already open',
        token: tokens.organizer
      });
      // hackathon seeded with registrationOpen: true
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/hackathons/:id/close-registration', () => {
    it('Organizer-owner successfully closes an open registration window', async () => {
      const res = await logged('patch', `/api/hackathons/${hackathon._id}/close-registration`, {
        suite: 'Hackathon > Close Registration',
        caseName: 'Organizer-owner successfully closes an open registration window',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
    });
  });
});
