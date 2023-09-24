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

routerUsers.get('/users/me', getCurrentUser);

routerUsers.get('/users/:userId', validationUserId, getUserById);

routerUsers.patch('/users/me', validationUpdateUser, updateUser);

routerUsers.patch('/users/me/avatar', validationUpdateAvatar, updateAvatar);

module.exports = routerUsers;
