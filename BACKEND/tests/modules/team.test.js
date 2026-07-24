import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedTeam } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';

let users, tokens, team;

beforeEach(async () => {
  await clearDatabase();
  const seed = await seedUsers();
  users = seed.users;
  tokens = seed.tokens;
  team = await seedTeam(users.participant._id);
});

describe('4. Team Module (/api/teams)', () => {

  describe('GET /api/teams/ (Admin)', () => {
    it('Admin successfully lists teams with pagination, search, and sort', async () => {
      const res = await logged('get', '/api/teams/', {
        suite: 'Team > Admin List',
        caseName: 'Admin successfully lists teams',
        token: tokens.admin
      });
      expect(res.status).toBe(200);
      expect(res.body.data.teams).toBeDefined();
    });

    it('Rejects non-admin roles', async () => {
      const res = await logged('get', '/api/teams/', {
        suite: 'Team > Admin List',
        caseName: 'Rejects non-admin roles',
        token: tokens.participant
      });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/teams/', () => {
    it('Participant successfully creates a team with valid name', async () => {
      const res = await logged('post', '/api/teams/', {
        suite: 'Team > Create',
        caseName: 'Participant successfully creates a team with valid name',
        token: tokens.participant2,
        body: { name: 'My New Team' }
      });
      expect(res.status).toBe(201);
      expect(res.body.data.leader._id.toString()).toBe(users.participant2._id.toString());
    });

    it('Rejects non-participant roles', async () => {
      const res = await logged('post', '/api/teams/', {
        suite: 'Team > Create',
        caseName: 'Rejects non-participant roles',
        token: tokens.organizer,
        body: { name: 'Org Team' }
      });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/teams/:id', () => {
    it('Successfully fetches a team by ID', async () => {
      const res = await logged('get', `/api/teams/${team._id}`, {
        suite: 'Team > Get By ID',
        caseName: 'Successfully fetches a team by ID',
        token: tokens.participant
      });
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/teams/:id', () => {
    it('Team leader successfully updates name and/or description', async () => {
      const res = await logged('put', `/api/teams/${team._id}`, {
        suite: 'Team > Update',
        caseName: 'Team leader successfully updates name and/or description',
        token: tokens.participant,
        body: { name: 'Updated Team Name' }
      });
      expect(res.status).toBe(200);
    });

    it('Rejects a non-leader member attempting to update', async () => {
      // Add participant2 to team
      team.members.push(users.participant2._id);
      await team.save();

      const res = await logged('put', `/api/teams/${team._id}`, {
        suite: 'Team > Update',
        caseName: 'Rejects a non-leader member attempting to update',
        token: tokens.participant2,
        body: { name: 'Hacked Team Name' }
      });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/teams/:id/invite', () => {
    it('Team leader successfully invites a user by valid, existing email', async () => {
      const res = await logged('post', `/api/teams/${team._id}/invite`, {
        suite: 'Team > Invite',
        caseName: 'Team leader successfully invites a user by valid, existing email',
        token: tokens.participant,
        body: { email: 'part2@test.com' }
      });
      expect(res.status).toBe(200);
    });

    it('Rejects inviting a user who is already a team member', async () => {
      const res = await logged('post', `/api/teams/${team._id}/invite`, {
        suite: 'Team > Invite',
        caseName: 'Rejects inviting a user who is already a team member',
        token: tokens.participant,
        body: { email: 'part@test.com' } // leader is part
      });
      expect(res.status).toBe(400);
    });
  });

});
