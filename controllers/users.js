const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_NOT_FOUND } = require('http2').constants;
const User = require('../models/user');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch(() => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' }));
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.send({ data: user });
    })
    .catch(() => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar }).then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      }
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
};

module.exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { name: req.body.name, about: req.body.about },
    { new: true, runValidators: true },
  // eslint-disable-next-line consistent-return
  ).then((user) => {
    if (user === null) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
    }
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
  });
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  // eslint-disable-next-line consistent-return
  ).then((user) => {
    if (user === null) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
    }
    res.send(user);
  })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      } return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
};
