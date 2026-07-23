import User from '../models/User.model.js';
import Hackathon from '../models/Hackathon.model.js';
import Team from '../models/Team.model.js';
import Submission from '../models/Submission.model.js';
import Registration from '../models/Registration.model.js';
import JudgeAssignment from '../models/JudgeAssignment.model.js';
import Review from '../models/Review.model.js';
class DashboardService {
    async getAdminDashboard() {
        const [totalUsers, totalHackathons, totalTeams, totalSubmissions] = await Promise.all([
            User.countDocuments(),
            Hackathon.countDocuments(),
            Team.countDocuments(),
            Submission.countDocuments(),
        ]);
        return {
            totalUsers: totalUsers,
            totalHackathons: totalHackathons,
            totalTeams: totalTeams,
            totalSubmissions: totalSubmissions,
            platformGrowth: { users: [], hackathons: [] },
        };
    }
    async getOrganizerDashboard(user) {
        const hackathons = await Hackathon.find({ organizer: user._id }).select(
            '_id resultsPublished'
        );
        const hackathonIds = hackathons.map((hackathon) => hackathon._id);
        const [totalRegistrations, totalSubmissions] = await Promise.all([
            Registration.countDocuments({ hackathon: { $in: hackathonIds } }),
            Submission.aggregate([
                {
                    $lookup: {
                        from: 'registrations',
                        localField: 'registration',
                        foreignField: '_id',
                        as: 'registration',
                    },
                },
                { $unwind: '$registration' },
                { $match: { 'registration.hackathon': { $in: hackathonIds } } },
                { $count: 'total' },
            ]),
        ]);
        return {
            myHackathons: hackathons.length,
            totalRegistrations: totalRegistrations,
            totalSubmissions: totalSubmissions.length > 0 ? totalSubmissions[0].total : 0,
            winnersAnnounced: hackathons.filter((hackathon) => hackathon.resultsPublished).length,
        };
    }
    async getParticipantDashboard(user) {
        const teams = await Team.find({ members: user._id }).select('name');
        const teamIds = teams.map((team) => team._id);
        const registrations = await Registration.find({ team: { $in: teamIds } }).populate(
            'hackathon',
            'title resultsPublished'
        );
        const registrationIds = registrations.map((registration) => registration._id);
        const submissions = await Submission.find({
            registration: { $in: registrationIds },
        }).populate({ path: 'registration', populate: { path: 'hackathon', select: 'title' } });
        return {
            registeredHackathons: registrations.length,
            teams: teams.map((team) => ({ id: team._id, name: team.name })),
            submissions: submissions.map((submission) => ({
                id: submission._id,
                projectName: submission.projectName,
                averageScore: submission.averageScore,
                reviewCount: submission.reviewCount,
                hackathon: submission.registration.hackathon.title,
            })),
            resultsPublished: registrations.filter(
                (registration) => registration.hackathon.resultsPublished
            ).length,
        };
    }
    async getJudgeDashboard(user) {
        const assignments = await JudgeAssignment.find({ judge: user._id });
        const hackathonIds = assignments.map((assignment) => assignment.hackathon);
        const assignedSubmissions = await Submission.aggregate([
            {
                $lookup: {
                    from: 'registrations',
                    localField: 'registration',
                    foreignField: '_id',
                    as: 'registration',
                },
            },
            { $unwind: '$registration' },
            { $match: { 'registration.hackathon': { $in: hackathonIds } } },
            { $project: { _id: 1 } },
        ]);
        const reviews = await Review.find({ judge: user._id });
        const reviewedSubmissionIds = new Set(
            reviews.map((review) => review.submission.toString())
        );
        const pendingReviews = assignedSubmissions.filter(
            (submission) => !reviewedSubmissionIds.has(submission._id.toString())
        ).length;
        return {
            assignedHackathons: assignments.length,
            assignedProjects: assignedSubmissions.length,
            completedReviews: reviews.length,
            pendingReviews: pendingReviews,
        };
    }
}
export default new DashboardService();
