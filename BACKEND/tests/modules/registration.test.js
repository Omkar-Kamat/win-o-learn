import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedHackathon, seedTeam, seedRegistration } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';

let users, tokens, hackathon, team, registration;

beforeEach(async () => {
  await clearDatabase();
  const seed = await seedUsers();
  users = seed.users;
  tokens = seed.tokens;
  hackathon = await seedHackathon(users.organizer._id);
  team = await seedTeam(users.participant._id);
});

describe('5. Registration Module (/api/hackathons/:hackathonId/register*)', () => {

  describe('POST /api/hackathons/:hackathonId/register', () => {
    it('Team leader successfully registers their team for an open hackathon before the deadline', async () => {
      const res = await logged('post', `/api/hackathons/${hackathon._id}/register`, {
        suite: 'Registration > Register',
        caseName: 'Team leader successfully registers their team for an open hackathon before the deadline',
        token: tokens.participant,
        body: { teamId: team._id }
      });
      expect(res.status).toBe(201);
    });

    it('Rejects a non-leader team member from registering the team', async () => {
      team.members.push(users.participant2._id);
      await team.save();

      const res = await logged('post', `/api/hackathons/${hackathon._id}/register`, {
        suite: 'Registration > Register',
        caseName: 'Rejects a non-leader team member from registering the team',
        token: tokens.participant2,
        body: { teamId: team._id }
      });
      expect(res.status).toBe(403);
    });

    it('Rejects when the team is already registered for the same hackathon', async () => {
      await seedRegistration(hackathon._id, team._id);
      
      const res = await logged('post', `/api/hackathons/${hackathon._id}/register`, {
        suite: 'Registration > Register',
        caseName: 'Rejects when the team is already registered for the same hackathon',
        token: tokens.participant,
        body: { teamId: team._id }
      });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/hackathons/:hackathonId/register/status/:teamId', () => {
    it('Team member successfully retrieves { registered: false } when not registered', async () => {
      const res = await logged('get', `/api/hackathons/${hackathon._id}/register/status/${team._id}`, {
        suite: 'Registration > Status',
        caseName: 'Team member successfully retrieves { registered: false } when not registered',
        token: tokens.participant
      });
      expect(res.status).toBe(200);
      expect(res.body.data.registered).toBe(false);
    });

    it('Team member successfully retrieves { registered: true, status } when registered', async () => {
      await seedRegistration(hackathon._id, team._id);

      const res = await logged('get', `/api/hackathons/${hackathon._id}/register/status/${team._id}`, {
        suite: 'Registration > Status',
        caseName: 'Team member successfully retrieves { registered: true, status } when registered',
        token: tokens.participant
      });
      expect(res.status).toBe(200);
      expect(res.body.data.registered).toBe(true);
      expect(res.body.data.status).toBe('approved');
    });
  });

  describe('GET /api/hackathons/:hackathonId/registrations', () => {
    it('Organizer-owner successfully lists registrations for their hackathon, paginated', async () => {
      await seedRegistration(hackathon._id, team._id);

      const res = await logged('get', `/api/hackathons/${hackathon._id}/registrations`, {
        suite: 'Registration > Organizer List',
        caseName: 'Organizer-owner successfully lists registrations for their hackathon, paginated',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.registrations)).toBe(true);
    });
  });

  describe('PATCH /api/registrations/:registrationId/approve', () => {
    it('Organizer-owner successfully approves a pending registration', async () => {
      const pendingReg = await (await import('../../models/Registration.model.js')).default.create({
        hackathon: hackathon._id,
        team: team._id,
        status: 'pending'
      });

      const res = await logged('patch', `/api/registrations/${pendingReg._id}/approve`, {
        suite: 'Registration > Approve',
        caseName: 'Organizer-owner successfully approves a pending registration',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
    });
  });

});
