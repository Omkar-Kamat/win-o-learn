import Hackathon from '../models/Hackathon.model.js';
// Creates a new. 
const create = hackathonData => Hackathon.create(hackathonData);
// Searches and retrieves by id. 
const findById = id => Hackathon.findById(id).populate('organizer', 'name avatar');
// Searches and retrieves all. 
const findAll = async ({
  search = '',
  mode: mode,
  registrationOpen: registrationOpen,
  status: status,
  theme: theme,
  sort: sort,
  page = 1,
  limit = 20
}) => {
  const filter = {};
  if (search) {
    filter.$or = [{
      title: {
        $regex: search,
        $options: 'i'
      }
    }, {
      theme: {
        $regex: search,
        $options: 'i'
      }
    }, {
      description: {
        $regex: search,
        $options: 'i'
      }
    }];
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
      $gt: now
    };
  }
  if (status === 'ongoing') {
    filter.startDate = {
      $lte: now
    };
    filter.endDate = {
      $gte: now
    };
  }
  if (status === 'completed') {
    filter.endDate = {
      $lt: now
    };
  }
  let sortOption = {
    startDate: 1
  };
  if (sort) {
    sortOption = {};
    if (sort.startsWith('-')) {
      sortOption[sort.substring(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }
  }
  const hackathons = await Hackathon.find(filter).populate('organizer', 'name avatar').sort(sortOption).skip((page - 1) * limit).limit(limit);
  const total = await Hackathon.countDocuments(filter);
  return {
    hackathons: hackathons,
    total: total
  };
};
// Searches and retrieves by organizer. 
const findByOrganizer = async (organizerId, {
  page = 1,
  limit = 20
} = {}) => {
  const hackathons = await Hackathon.find({
    organizer: organizerId
  }).sort({
    createdAt: -1
  }).skip((page - 1) * limit).limit(limit);
  const total = await Hackathon.countDocuments({
    organizer: organizerId
  });
  return {
    hackathons: hackathons,
    total: total
  };
};
// Updates an existing by id. 
const updateById = (id, fields) => Hackathon.findByIdAndUpdate(id, fields, {
  new: true,
  runValidators: true
});
// Removes the specified by id. 
const deleteById = id => Hackathon.findByIdAndDelete(id);
// Updates registration status. 
const setRegistrationStatus = (id, registrationOpen) => Hackathon.findByIdAndUpdate(id, {
  registrationOpen: registrationOpen
}, {
  new: true,
  runValidators: true
});
// Publishes the results. 
const publishResults = id => Hackathon.findByIdAndUpdate(id, {
  resultsPublished: true
}, {
  new: true,
  runValidators: true
});
// Updates an existing banner. 
const updateBanner = (id, banner, bannerPublicId) => Hackathon.findByIdAndUpdate(id, {
  banner: banner,
  bannerPublicId: bannerPublicId
}, {
  new: true,
  runValidators: true
});
export default {
  create: create,
  findById: findById,
  findAll: findAll,
  findByOrganizer: findByOrganizer,
  updateById: updateById,
  deleteById: deleteById,
  setRegistrationStatus: setRegistrationStatus,
  publishResults: publishResults,
  updateBanner: updateBanner
};