const routerUsers = require('express').Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

const {
  validationUserId,
  validationUpdateUser,
  validationUpdateAvatar,
} = require('../middlewares/validation');

routerUsers.get('/users', getAllUsers);

routerUsers.get('/users/:userId', validationUserId, getUserById);

routerUsers.patch('/users/me', validationUpdateUser, updateUser);

routerUsers.patch('/users/me/avatar', validationUpdateAvatar, updateAvatar);

routerUsers.get('/me', getCurrentUser);

module.exports = routerUsers;
