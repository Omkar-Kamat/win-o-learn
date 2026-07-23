/**
 * File: Registration.repository.js
 * Description: Implementation of Registration.repository.js
 */
import Registration from '../models/Registration.model.js';
import TeamRepository from './Team.repository.js';

// Creates a new create
const create = (registrationData) => Registration.create(registrationData);

// Performs the find by id operation
const findById = (registrationId) =>
    Registration.findById(registrationId)
        .populate({
            path: 'hackathon',
            populate: {
                path: 'organizer',
                select: 'name avatar',
            },
        })
        .populate({
            path: 'team',
            populate: [
                {
                    path: 'leader',
                    select: 'name avatar',
                },
                {
                    path: 'members',
                    select: 'name avatar',
                },
            ],
        });

// Performs the find by hackathon and team operation
const findByHackathonAndTeam = (hackathonId, teamId) =>
    Registration.findOne({
        hackathon: hackathonId,
        team: teamId,
    });

// Performs the find by hackathon and user operation
const findByHackathonAndUser = async (hackathonId, userId) => {
    const teams = await TeamRepository.findByMember(userId);

    // Performs the team ids operation
    const teamIds = teams.map((team) => team._id);
    if (teamIds.length === 0) {
        return null;
    }

    return Registration.findOne({
        hackathon: hackathonId,
        team: {
            $in: teamIds,
        },
    }).populate({
        path: 'team',
        populate: [
            {
                path: 'leader',
                select: 'name avatar',
            },
            {
                path: 'members',
                select: 'name avatar',
            },
        ],
    });
};


// Performs the find all by hackathon operation
const findAllByHackathon = async (hackathonId, { status, page = 1, limit = 20 }) => {
    const filter = {
        hackathon: hackathonId,
    };
    if (status) {
        filter.status = status;
    }
    const skip = (page - 1) * limit;
    const [registrations, total] = await Promise.all([
        Registration.find(filter)
            .populate({
                path: 'team',
                populate: [
                    {
                        path: 'leader',
                        select: 'name avatar',
                    },
                    {
                        path: 'members',
                        select: 'name avatar',
                    },
                ],
            })
            .skip(skip)
            .limit(limit)
            .sort({
                createdAt: -1,
            }),
        Registration.countDocuments(filter),
    ]);

    return {
        registrations,
        total,
    };
};


// Removes the by hackathon and team
const deleteByHackathonAndTeam = (hackathonId, teamId) =>
    Registration.findOneAndDelete({
        hackathon: hackathonId,
        team: teamId,
    });

// Updates the status data
const setStatus = (registrationId, status, respondedBy) =>
    Registration.findByIdAndUpdate(
        registrationId,
        {
            status,
            respondedBy,
            respondedAt: new Date(),
        },
        {
            new: true,
        }
    );

// Performs the find by hackathon operation
const findByHackathon = (hackathonId) =>
    Registration.find({
        hackathon: hackathonId,
        status: {
            $ne: 'rejected',
        },
    }).populate({
        path: 'team',
        select: 'members',
    });

// Performs the exists by team operation
const existsByTeam = (teamId) =>
    Registration.exists({
        team: teamId,
        status: {
            $ne: 'rejected',
        },
    });

export default {
    create,
    findById,
    findByHackathonAndTeam,
    findByHackathonAndUser,
    findByHackathon,
    findAllByHackathon,
    deleteByHackathonAndTeam,
    setStatus,
    existsByTeam,
};
