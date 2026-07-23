/**
 * File: Hackathon.repository.js
 * Description: Implementation of Hackathon.repository.js
 */
import Hackathon from '../models/Hackathon.model.js';

// Creates a new create
const create = (hackathonData) => {
    return Hackathon.create(hackathonData);
};


// Performs the find by id operation
const findById = (id) => {
    return Hackathon.findById(id).populate('organizer', 'name avatar');
};


// Performs the find all operation
const findAll = async ({
    search = '',
    mode,
    registrationOpen,
    status,
    theme,
    sort,
    page = 1,
    limit = 20,
}) => {
    const filter = {};
    if (search) {
        filter.$or = [
            {
                title: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                theme: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                description: {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }
    if (theme) {
        filter.theme = theme;
    }
    if (mode) {
        filter.mode = mode;
    }
    if (typeof registrationOpen !== 'undefined') {
        filter.registrationOpen = registrationOpen === 'true' || registrationOpen === true;
    }
    const now = new Date();
    if (status === 'upcoming') {
        filter.registrationStartDate = {
            $gt: now,
        };
    }
    if (status === 'ongoing') {
        filter.startDate = {
            $lte: now,
        };
        filter.endDate = {
            $gte: now,
        };
    }
    if (status === 'completed') {
        filter.endDate = {
            $lt: now,
        };
    }
    
    let sortOption = { startDate: 1 };
    if (sort) {
        sortOption = {};
        if (sort.startsWith('-')) {
            sortOption[sort.substring(1)] = -1;
        } else {
            sortOption[sort] = 1;
        }
    }
    const hackathons = await Hackathon.find(filter)
        .populate('organizer', 'name avatar')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await Hackathon.countDocuments(filter);

    return {
        hackathons,
        total,
    };
};


// Performs the find by organizer operation
const findByOrganizer = async (organizerId, { page = 1, limit = 20 } = {}) => {
    const hackathons = await Hackathon.find({
        organizer: organizerId,
    })
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await Hackathon.countDocuments({
        organizer: organizerId,
    });

    return {
        hackathons,
        total,
    };
};


// Updates the by id data
const updateById = (id, fields) => {
    return Hackathon.findByIdAndUpdate(id, fields, {
        new: true,
        runValidators: true,
    });
};


// Removes the by id
const deleteById = (id) => {
    return Hackathon.findByIdAndDelete(id);
};


// Updates the registration status data
const setRegistrationStatus = (id, registrationOpen) => {
    return Hackathon.findByIdAndUpdate(
        id,
        {
            registrationOpen,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


// Performs the publish results operation
const publishResults = (id) => {
    return Hackathon.findByIdAndUpdate(
        id,
        {
            resultsPublished: true,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


// Updates the banner data
const updateBanner = (id, banner, bannerPublicId) => {
    return Hackathon.findByIdAndUpdate(
        id,
        {
            banner,
            bannerPublicId,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


export default {
    create,
    findById,
    findAll,
    findByOrganizer,
    updateById,
    deleteById,
    setRegistrationStatus,
    publishResults,
    updateBanner,
};
