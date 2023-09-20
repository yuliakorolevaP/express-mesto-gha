const User = require('../models/user');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch(() => res.status(500).send({ message: 'Что-то пошло не так' }));
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Что-то пошло не так' });
      }
      return res.send({ data: user });
    })
    .catch(() => res.status(400).send({ message: 'Что-то пошло не так' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar }).then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'Что-то пошло не так' });
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
      return res.status(500).send({ message: `Пользователь c _id ${req.user._id} не найден.` });
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Некорректные данные пользователя' });
    }
    return res.status(500).send({ message: 'Что-то пошло не так' });
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
      return res.status(500).send({ message: `Пользователь c _id ${req.user._id} не найден.` });
    }
    res.send(user);
  })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(400).send({ message: `Некорректные данные пользователя: ${err.message}` });
      } return res.status(500).send({ message: 'Что-то пошло не так' });
    });
};
