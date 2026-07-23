import Submission from '../models/Submission.model.js';
import Registration from '../models/Registration.model.js';
const create = (data) => Submission.create(data);
const findById = (id) =>
    Submission.findById(id).populate({
        path: 'registration',
        populate: [{ path: 'team' }, { path: 'hackathon' }],
    });
const findAll = async ({ search: search = '', page: page = 1, limit: limit = 20, sort: sort }) => {
    const filter = {};
    if (search) {
        filter.projectName = { $regex: search, $options: 'i' };
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
        .populate({ path: 'registration', populate: [{ path: 'team' }, { path: 'hackathon' }] })
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await Submission.countDocuments(filter);
    return { submissions: submissions, total: total };
};
const findByRegistration = (registrationId) =>
    Submission.findOne({ registration: registrationId }).populate({
        path: 'registration',
        populate: [{ path: 'team' }, { path: 'hackathon' }],
    });
const findAllByHackathon = async (hackathonId) => {
    const registrations = await Registration.find({ hackathon: hackathonId }).select('_id');
    const registrationIds = registrations.map((r) => r._id);
    return Submission.find({ registration: { $in: registrationIds } }).populate({
        path: 'registration',
        populate: [{ path: 'team' }, { path: 'hackathon' }],
    });
};
const updateById = (id, data) =>
    Submission.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate({
        path: 'registration',
        populate: [{ path: 'team' }, { path: 'hackathon' }],
    });
export default {
    create: create,
    findAll: findAll,
    findById: findById,
    findByRegistration: findByRegistration,
    findAllByHackathon: findAllByHackathon,
    updateById: updateById,
};
