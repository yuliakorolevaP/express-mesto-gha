const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/no-unresolved
const BadRequest = require('../middlewares/Badrequest');
const NotFound = require('../middlewares/NotFound');
const Conflict = require('../middlewares/Conflict');
const Unauthorized = require('../middlewares/Unauthorized');

const User = require('../models/user');

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => next(err));
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные'));
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })).then((user) => res.send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Некорректный адрес URL'));
      }
      if (err.code === 11000) {
        next(new Conflict('Пользователь с таким email уже существует'));
      }
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { name: req.body.name, about: req.body.about },
    { new: true, runValidators: true },
  // eslint-disable-next-line consistent-return
  ).then((user) => {
    if (!user) {
      throw new NotFound('Пользователь не найден');
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные'));
    }
    next(err);
  });
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  // eslint-disable-next-line consistent-return
  ).then((user) => {
    if (!user) {
      throw new NotFound('Пользователь не найден');
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные'));
    }
    next(err);
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        throw new Unauthorized('Необходима авторизация');
      }
      bcrypt.compare(password, user.password)
        // eslint-disable-next-line consistent-return
        .then((match) => {
          if (!match) {
            throw new Unauthorized('Необходима авторизация');
          }
          const token = jwt.sign({ _id: user._id }, 'practicum2023', { expiresIn: '7d' });
          res.status(200).cookie('jwt', token, { httpOnly: true }).send({ token });
        }).catch((err) => next(err));
    })
    .catch((err) => next(err));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    if (!user) {
      throw new NotFound('Пользователь не найден');
    }
    return res.status(200).send({ user });
  }).catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные'));
    }
    next(err);
  });
};
