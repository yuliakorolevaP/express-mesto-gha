const routerUsers = require('express').Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

routerUsers.get('/users', getAllUsers);

routerUsers.get('/users/:userId', getUserById);

routerUsers.patch('/users/me', updateUser);

routerUsers.patch('/users/me/avatar', updateAvatar);

routerUsers.get('/me', getCurrentUser);

module.exports = routerUsers;
