const routerUsers = require('express').Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

routerUsers.get('/users', getAllUsers);

routerUsers.get('/users/:userId', getUserById);

routerUsers.post('/users', createUser);

routerUsers.patch('/users/me', updateUser);

routerUsers.patch('/users/me/avatar', updateAvatar);

module.exports = routerUsers;
