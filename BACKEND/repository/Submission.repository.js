import Submission from '../models/Submission.model.js';
import Registration from '../models/Registration.model.js';
// Creates a new. 
const create = data => Submission.create(data);
// Searches and retrieves by id. 
const findById = id => Submission.findById(id).populate({
  path: 'registration',
  populate: [{
    path: 'team'
  }, {
    path: 'hackathon'
  }]
});
// Searches and retrieves all. 
const findAll = async ({
  search = '',
  page = 1,
  limit = 20,
  sort: sort
}, allowedRegistrationIds = null) => {
  const filter = {};
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.projectName = {
      $regex: escapedSearch,
      $options: 'i'
    };
  }
  let sortOption = {
    createdAt: -1
  };
  if (sort) {
    sortOption = {};
    if (sort.startsWith('-')) {
      sortOption[sort.substring(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }
  }
  if (allowedRegistrationIds) {
    filter.registration = { $in: allowedRegistrationIds };
  }
  
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  
  const submissions = await Submission.find(filter).populate({
    path: 'registration',
    populate: [{
      path: 'team'
    }, {
      path: 'hackathon'
    }]
  }).sort(sortOption).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
  const total = await Submission.countDocuments(filter);
  return {
    submissions: submissions,
    total: total
  };
};
// Searches and retrieves by registration. 
const findByRegistration = registrationId => Submission.findOne({
  registration: registrationId
}).populate({
  path: 'registration',
  populate: [{
    path: 'team'
  }, {
    path: 'hackathon'
  }]
});
// Searches and retrieves all by hackathon. 
const findAllByHackathon = async hackathonId => {
  const registrations = await Registration.find({
    hackathon: hackathonId
  }).select('_id');
  const registrationIds = registrations.map(r => r._id);
  return Submission.find({
    registration: {
      $in: registrationIds
    }
  }).populate({
    path: 'registration',
    populate: [{
      path: 'team'
    }, {
      path: 'hackathon'
    }]
  });
};
// Updates an existing by id. 
const updateById = (id, data) => Submission.findByIdAndUpdate(id, data, {
  new: true,
  runValidators: true
}).populate({
  path: 'registration',
  populate: [{
    path: 'team'
  }, {
    path: 'hackathon'
  }]
});
export default {
  create: create,
  findAll: findAll,
  findById: findById,
  findByRegistration: findByRegistration,
  findAllByHackathon: findAllByHackathon,
  updateById: updateById
};