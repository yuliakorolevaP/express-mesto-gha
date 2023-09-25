const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/no-unresolved
const BadRequest = require('../middlewares/Badrequest');
const InternalServerError = require('../middlewares/InternalServerError');
const NotFound = require('../middlewares/NotFound');
// eslint-disable-next-line import/order
const { HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_NOT_FOUND } = require('http2').constants;

const User = require('../models/user');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch(() => new InternalServerError('На сервере произошла ошибка'));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден' });
      }
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные');
      }
      throw new InternalServerError('На сервере произошла ошибка');
    });
};

module.exports.createUser = (req, res) => {
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
        throw new BadRequest('Некорректный адрес URL');
      }
      if (err.code === 11000) {
        return res.status(409).send({ message: 'Пользователь с таким email уже существует' });
      }
      throw new InternalServerError('На сервере произошла ошибка');
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
      throw new NotFound('Пользователь с указанным _id не найден');
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      throw new BadRequest('Переданы некорректные данные');
    }
    throw new InternalServerError('На сервере произошла ошибка');
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
      throw new NotFound('Пользователь с указанным _id не найден');
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      throw new BadRequest('Переданы некорректные данные');
    }
    throw new InternalServerError('На сервере произошла ошибка');
  });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходима авторизация' });
      }
      bcrypt.compare(password, user.password)
        // eslint-disable-next-line consistent-return
        .then((match) => {
          if (!match) {
            return res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходима авторизация' });
          }
          const token = jwt.sign({ _id: user._id }, 'practicum2023', { expiresIn: '7d' });
          res.status(200).cookie('jwt', token, { httpOnly: true }).send({ token });
        }).catch((err) => res.send(err));
    })
    .catch((err) => res.send(err));
};

module.exports.getCurrentUser = (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (!user) {
      throw new NotFound('Пользователь с указанным _id не найден');
    }
    return res.status(200).send({ user });
  }).catch((err) => {
    if (err.name === 'CastError') {
      throw new BadRequest('Переданы некорректные данные');
    }
    throw new InternalServerError('На сервере произошла ошибка');
  });
};
