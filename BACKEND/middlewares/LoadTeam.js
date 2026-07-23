import asyncHandler from './AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import TeamRepository from '../repository/Team.repository.js';
const LoadTeam = (options = {}) =>
    asyncHandler(async (req, res, next) => {
        const {
            requireLeader: requireLeader = false,
            requireMember: requireMember = false,
            requireInvitee: requireInvitee = false,
        } = options;
        const teamId = req.params.id ?? req.params.teamId ?? req.body?.teamId ?? req.query?.teamId;
        const team = await TeamRepository.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found.');
        }
        const leaderId = team.leader._id ?? team.leader;
        if (requireLeader && !leaderId.equals(req.user._id)) {
            throw new ApiError(403, 'Only the team leader can perform this action.');
        }
        if (
            requireMember &&
            !team.members.some((member) => (member._id ?? member).equals(req.user._id))
        ) {
            throw new ApiError(403, 'You are not a member of this team.');
        }
        if (requireInvitee) {
            const isInvitee = team.pendingInvites.some((invite) =>
                (invite.user._id ?? invite.user).equals(req.user._id)
            );
            if (!isInvitee) {
                throw new ApiError(403, 'You do not have a pending invite for this team.');
            }
        }
        req.team = team;
        next();
    });
export default LoadTeam;
