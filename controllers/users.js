const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_UNAUTHORIZED,
} = require('http2').constants;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BadRequest = require('../middlewares/Badrequest');
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
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      }
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })).then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Некорректный адрес URL');
      }
      if (err.code === 11000) {
        return res.status(409).send({ message: 'Пользователь с таким email уже существует' });
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
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
    } return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
  });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        res.status(HTTP_STATUS_UNAUTHORIZED)
          .send({ message: 'Неправильные почта или пароль' });
      } else {
        bcrypt.compare(password, user.password)
          .then((matched) => {
            if (!matched) {
              res.status(HTTP_STATUS_UNAUTHORIZED)
                .send({ message: 'Неправильные почта или пароль' });
            } else {
              const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
              res
                .status(200)
                .cookie('jwt', token, { httpOnly: true })
                .send({ token });
            }
          }).catch((err) => res.send(err));
      }
    })
    .catch((err) => res.send(err));
};

module.exports.getCurrentUser = (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' });
    }
    return res.send(user);
  }).catch((err) => {
    if (err.name === 'CastError') {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
    }
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
  });
};
