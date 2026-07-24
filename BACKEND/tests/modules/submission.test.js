import mongoose from 'mongoose';
import { clearDatabase, seedUsers, seedHackathon, seedTeam, seedRegistration, seedSubmission } from '../utils/seed.js';
import { logged } from '../utils/logRequest.js';

let users, tokens, hackathon, team, registration, submission;

beforeEach(async () => {
  await clearDatabase();
  const seed = await seedUsers();
  users = seed.users;
  tokens = seed.tokens;
  hackathon = await seedHackathon(users.organizer._id);
  team = await seedTeam(users.participant._id);
  registration = await seedRegistration(hackathon._id, team._id);
});

describe('6. Submission Module (/api/submissions)', () => {

  describe('POST /api/hackathons/:hackathonId/submissions', () => {
    it('Team leader successfully creates a submission for an approved registration before the deadline', async () => {
      const res = await logged('post', `/api/hackathons/${hackathon._id}/submissions`, {
        suite: 'Submission > Create',
        caseName: 'Team leader successfully creates a submission',
        token: tokens.participant,
        body: {
          projectName: 'My Project',
          problemStatement: 'Solving X',
          solutionDescription: 'Using Y',
          techStack: ['React', 'Node'],
          githubRepo: 'https://github.com/my/project'
        }
      });
      expect(res.status).toBe(201);
    });

    it('Rejects a non-leader team member from creating the submission', async () => {
      team.members.push(users.participant2._id);
      await team.save();

      const res = await logged('post', `/api/hackathons/${hackathon._id}/submissions`, {
        suite: 'Submission > Create',
        caseName: 'Rejects a non-leader team member from creating the submission',
        token: tokens.participant2,
        body: {
          projectName: 'My Project',
          problemStatement: 'Solving X',
          solutionDescription: 'Using Y',
          techStack: ['React', 'Node'],
          githubRepo: 'https://github.com/my/project'
        }
      });
      expect(res.status).toBe(403);
    });

    it('Rejects missing projectName, problemStatement, or solutionDescription', async () => {
      const res = await logged('post', `/api/hackathons/${hackathon._id}/submissions`, {
        suite: 'Submission > Create',
        caseName: 'Rejects missing projectName, problemStatement, or solutionDescription',
        token: tokens.participant,
        body: {
          projectName: 'My Project'
        }
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/hackathons/:hackathonId/submissions/mine', () => {
    it('Team member successfully retrieves their team own submission', async () => {
      await seedSubmission(hackathon._id, registration._id);

      const res = await logged('get', `/api/hackathons/${hackathon._id}/submissions/mine`, {
        suite: 'Submission > Get Mine',
        caseName: 'Team member successfully retrieves their team own submission',
        token: tokens.participant
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/hackathons/:hackathonId/submissions', () => {
    it('Organizer-owner successfully lists all submissions for their hackathon', async () => {
      await seedSubmission(hackathon._id, registration._id);

      const res = await logged('get', `/api/hackathons/${hackathon._id}/submissions`, {
        suite: 'Submission > Organizer List',
        caseName: 'Organizer-owner successfully lists all submissions for their hackathon',
        token: tokens.organizer
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/submissions/:id', () => {
    it('Admin/organizer/team member successfully retrieves a submission', async () => {
      const sub = await seedSubmission(hackathon._id, registration._id);

      const res = await logged('get', `/api/submissions/${sub._id}`, {
        suite: 'Submission > Get By ID',
        caseName: 'Admin/organizer/team member successfully retrieves a submission',
        token: tokens.participant
      });
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/submissions/:id', () => {
    it('Team leader successfully updates submission fields before the deadline', async () => {
      const sub = await seedSubmission(hackathon._id, registration._id);

      const res = await logged('put', `/api/submissions/${sub._id}`, {
        suite: 'Submission > Update',
        caseName: 'Team leader successfully updates submission fields before the deadline',
        token: tokens.participant,
        body: { projectName: 'Updated Project Name' }
      });
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/submissions/:id/status', () => {
    it('Hackathon organizer successfully updates submission status to a valid value', async () => {
      const sub = await seedSubmission(hackathon._id, registration._id);

      const res = await logged('patch', `/api/submissions/${sub._id}/status`, {
        suite: 'Submission > Update Status',
        caseName: 'Hackathon organizer successfully updates submission status to a valid value',
        token: tokens.organizer,
        body: { status: 'approved' }
      });
      expect(res.status).toBe(200);
    });
  });
});
