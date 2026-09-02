const { User } = require('../modelos');

const create = async (userData) => {
    const user = new User(userData);
    return user.save();
};

const getById = async (id) => {
  return User.findById(id);
};

const get = async (user={}) => {
    return User.find(user);
};

const updateById = async (id, updates = {}) => {
  return User.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = {
  create,
  getById,
  get,
  updateById
};