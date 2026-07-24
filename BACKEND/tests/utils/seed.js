import User from '../../models/User.model.js';
import Hackathon from '../../models/Hackathon.model.js';
import Team from '../../models/Team.model.js';
import Registration from '../../models/Registration.model.js';
import Submission from '../../models/Submission.model.js';
import JudgeAssignment from '../../models/JudgeAssignment.model.js';
import Review from '../../models/Review.model.js';
import { generateAccessToken } from '../../utils/GenerateToken.js';
import mongoose from 'mongoose';

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

export const seedUsers = async () => {
  const admin = await User.create({ name: 'Admin User', email: 'admin@test.com', password: 'Password1!', role: 'admin' });
  const organizer = await User.create({ name: 'Org User', email: 'org@test.com', password: 'Password1!', role: 'organizer' });
  const participant = await User.create({ name: 'Part User', email: 'part@test.com', password: 'Password1!', role: 'participant' });
  const participant2 = await User.create({ name: 'Part User 2', email: 'part2@test.com', password: 'Password1!', role: 'participant' });
  const judge = await User.create({ name: 'Judge User', email: 'judge@test.com', password: 'Password1!', role: 'judge' });

  const tokens = {
    admin: generateAccessToken(admin),
    organizer: generateAccessToken(organizer),
    participant: generateAccessToken(participant),
    participant2: generateAccessToken(participant2),
    judge: generateAccessToken(judge),
  };

  return { users: { admin, organizer, participant, participant2, judge }, tokens };
};

export const seedHackathon = async (organizerId) => {
  const d = new Date();
  const hackathon = await Hackathon.create({
    title: 'Test Hackathon',
    description: 'This is a test hackathon description that is at least 20 chars long.',
    theme: 'Technology',
    mode: 'online',
    registrationStartDate: new Date(d.getTime() - 86400000), // Yesterday
    registrationDeadline: new Date(d.getTime() + 86400000), // Tomorrow
    startDate: new Date(d.getTime() + 86400000 * 2), // 2 days from now
    submissionDeadline: new Date(d.getTime() + 86400000 * 3), // 3 days from now
    endDate: new Date(d.getTime() + 86400000 * 4), // 4 days from now
    prizePool: 1000,
    maxTeamSize: 4,
    judgingCriteria: [{ criterion: 'Innovation', maxMarks: 100 }, { criterion: 'Execution', maxMarks: 100 }],
    organizer: organizerId,
    registrationOpen: true
  });
  return hackathon;
};

export const seedTeam = async (leaderId, memberIds = []) => {
  const team = await Team.create({
    name: 'Test Team',
    leader: leaderId,
    members: [leaderId, ...memberIds]
  });
  return team;
};

export const seedRegistration = async (hackathonId, teamId, respondedBy = null) => {
  const reg = await Registration.create({
    hackathon: hackathonId,
    team: teamId,
    status: 'approved', // Default to approved so we can test submissions easily
    respondedBy
  });
  return reg;
};

export const seedSubmission = async (hackathonId, registrationId) => {
  const sub = await Submission.create({
    hackathon: hackathonId,
    registration: registrationId,
    projectName: 'Test Project',
    problemStatement: 'Problem...',
    solutionDescription: 'Solution...',
    techStack: ['Node', 'React'],
    githubRepo: 'https://github.com/test/repo',
    liveDemoUrl: 'https://test.com',
    status: 'under_review'
  });
  return sub;
};
