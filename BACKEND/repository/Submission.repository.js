/**
 * File: Submission.repository.js
 * Description: Implementation of Submission.repository.js
 */
import Submission from '../models/Submission.model.js';
import Registration from '../models/Registration.model.js';

// Creates a new create
const create = (data) => Submission.create(data);

// Performs the find by id operation
const findById = (id) =>
    Submission.findById(id).populate({
        path: 'registration',
        populate: [
            {
                path: 'team',
            },
            {
                path: 'hackathon',
            },
        ],
    });

// Performs the find all operation
const findAll = async ({ search = '', page = 1, limit = 20, sort }) => {
    const filter = {};
    if (search) {
        filter.projectName = {
            $regex: search,
            $options: 'i',
        };
    }
    
    let sortOption = { createdAt: -1 };
    if (sort) {
        sortOption = {};
        if (sort.startsWith('-')) {
            sortOption[sort.substring(1)] = -1;
        } else {
            sortOption[sort] = 1;
        }
    }

    const submissions = await Submission.find(filter)
        .populate({
            path: 'registration',
            populate: [
                { path: 'team' },
                { path: 'hackathon' },
            ],
        })
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
        
    const total = await Submission.countDocuments(filter);

    return {
        submissions,
        total,
    };
};

// Performs the find by registration operation
const findByRegistration = (registrationId) =>
    Submission.findOne({
        registration: registrationId,
    }).populate({
        path: 'registration',
        populate: [
            {
                path: 'team',
            },
            {
                path: 'hackathon',
            },
        ],
    });

// Performs the find all by hackathon operation
const findAllByHackathon = async (hackathonId) => {
    const registrations = await Registration.find({
        hackathon: hackathonId,
    }).select('_id');

    const registrationIds = registrations.map((r) => r._id);

    return Submission.find({
        registration: {
            $in: registrationIds,
        },
    }).populate({
        path: 'registration',
        populate: [
            {
                path: 'team',
            },
            {
                path: 'hackathon',
            },
        ],
    });
};


// Updates the by id data
const updateById = (id, data) =>
    Submission.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate({
        path: 'registration',
        populate: [
            {
                path: 'team',
            },
            {
                path: 'hackathon',
            },
        ],
    });

export default {
    create,
    findAll,
    findById,
    findByRegistration,
    findAllByHackathon,
    updateById,
};
