import mongoose from 'mongoose';
import { clearDatabase, seedUsers } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';
import User from '../../models/User.model.js';

let users, tokens;

beforeEach(async () => {
  await clearDatabase();
  const seed = await seedUsers();
  users = seed.users;
  tokens = seed.tokens;
});

describe('2. User Module (/api/users)', () => {
  
  describe('GET /api/users/me', () => {
    it('Returns the logged-in user profile', async () => {
      const res = await logged('get', '/api/users/me', {
        suite: 'User > Me',
        caseName: 'Returns the logged-in user profile',
        token: tokens.participant
      });
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(users.participant.email);
    });

    it('Rejects unauthenticated requests', async () => {
      const res = await logged('get', '/api/users/me', {
        suite: 'User > Me',
        caseName: 'Rejects unauthenticated requests'
      });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/me', () => {
    it('Successfully updates allowed fields: name, bio, skills, socials', async () => {
      const res = await logged('put', '/api/users/me', {
        suite: 'User > Update Me',
        caseName: 'Successfully updates allowed fields',
        token: tokens.participant,
        body: { name: 'New Name', bio: 'New bio', skills: ['Node.js'], socials: { github: 'https://github.com/new' } }
      });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New Name');
    });

    it('Rejects name outside 2–50 characters', async () => {
      const res = await logged('put', '/api/users/me', {
        suite: 'User > Update Me',
        caseName: 'Rejects name outside 2–50 characters',
        token: tokens.participant,
        body: { name: 'A' }
      });
      expect(res.status).toBe(400);
    });

    it('Rejects bio longer than 300 characters', async () => {
      const res = await logged('put', '/api/users/me', {
        suite: 'User > Update Me',
        caseName: 'Rejects bio longer than 300 characters',
        token: tokens.participant,
        body: { bio: 'A'.repeat(301) }
      });
      expect(res.status).toBe(400);
    });

    it('Rejects attempts to set protected fields directly', async () => {
      const res = await logged('put', '/api/users/me', {
        suite: 'User > Update Me',
        caseName: 'Rejects attempts to set protected fields directly',
        token: tokens.participant,
        body: { role: 'admin', isBlocked: true }
      });
      // The update should succeed but ignore protected fields or return 400 depending on validator.
      // Assuming 400 or ignores. Let's check status.
      // Wait, let's just make sure it doesn't apply it.
      // The prompt says "Rejects attempts to set protected fields (email, password, role, isBlocked, avatar, avatarPublicId) directly." -> [400]
      expect(res.status).toBe(400);
    });

    it('Rejects unauthenticated requests', async () => {
      const res = await logged('put', '/api/users/me', {
        suite: 'User > Update Me',
        caseName: 'Rejects unauthenticated requests',
        body: { name: 'New Name' }
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/ (Admin)', () => {
    it('Admin successfully lists users with default pagination', async () => {
      const res = await logged('get', '/api/users', {
        suite: 'User > Admin List',
        caseName: 'Admin successfully lists users with default pagination',
        token: tokens.admin
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('Supports filtering by search', async () => {
      const res = await logged('get', '/api/users?search=part', {
        suite: 'User > Admin List',
        caseName: 'Supports filtering by search',
        token: tokens.admin
      });
      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });

    it('Rejects non-admin roles', async () => {
      const res = await logged('get', '/api/users', {
        suite: 'User > Admin List',
        caseName: 'Rejects non-admin roles',
        token: tokens.participant
      });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/:id (Admin)', () => {
    it('Admin successfully fetches a user by valid Mongo ID', async () => {
      const res = await logged('get', `/api/users/${users.participant._id}`, {
        suite: 'User > Admin Get User',
        caseName: 'Admin successfully fetches a user by valid Mongo ID',
        token: tokens.admin
      });
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(users.participant._id.toString());
    });

    it('Rejects an invalid (non-Mongo) ID format', async () => {
      const res = await logged('get', `/api/users/invalid`, {
        suite: 'User > Admin Get User',
        caseName: 'Rejects an invalid (non-Mongo) ID format',
        token: tokens.admin
      });
      expect(res.status).toBe(400);
    });

    it('Returns not found for a valid but non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await logged('get', `/api/users/${fakeId}`, {
        suite: 'User > Admin Get User',
        caseName: 'Returns not found for a valid but non-existent ID',
        token: tokens.admin
      });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/users/:id/block (Admin)', () => {
    it('Admin successfully blocks another user', async () => {
      const res = await logged('patch', `/api/users/${users.participant._id}/block`, {
        suite: 'User > Admin Block',
        caseName: 'Admin successfully blocks another user',
        token: tokens.admin
      });
      expect(res.status).toBe(200);
      
      const updated = await User.findById(users.participant._id);
      expect(updated.isBlocked).toBe(true);
    });

    it('Rejects an admin attempting to block their own account', async () => {
      const res = await logged('patch', `/api/users/${users.admin._id}/block`, {
        suite: 'User > Admin Block',
        caseName: 'Rejects an admin attempting to block their own account',
        token: tokens.admin
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/users/:id/role (Admin)', () => {
    it('Admin successfully updates a user role to a valid value', async () => {
      const res = await logged('patch', `/api/users/${users.participant._id}/role`, {
        suite: 'User > Admin Update Role',
        caseName: 'Admin successfully updates a user role to a valid value',
        token: tokens.admin,
        body: { role: 'organizer' }
      });
      expect(res.status).toBe(200);
    });

    it('Rejects invalid role values', async () => {
      const res = await logged('patch', `/api/users/${users.participant._id}/role`, {
        suite: 'User > Admin Update Role',
        caseName: 'Rejects invalid role values',
        token: tokens.admin,
        body: { role: 'admin' }
      });
      expect(res.status).toBe(400);
    });
  });
});
