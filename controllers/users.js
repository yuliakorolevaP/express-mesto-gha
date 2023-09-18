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
        return res.status(404).send();
      }
      return res.send({ data: user });
    })
    .catch(() => res.status(500).send({ message: 'Что-то пошло не так' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar }).then((user) => res.send({ data: user }))
    .catch(() => { res.status(400).send({ message: 'Переданы некорректные данные' }); });
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { name: req.body.name, about: req.body.about },
    { new: true },
  ).then((user) => {
    if (user === null) {
      res.status(500).send({ message: `Пользователь c _id ${req.user._id} не найден.` });
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(500).send({ message: `Некорректные данные пользователя: ${err.message}` });
    } else {
      next(err);
    }
  });
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { avatar: req.body.avatar },
    { new: true },
  )
    .then((user) => {
      if (user === null) {
        res.status(500).send({ message: `Пользователь c _id ${req.user._id} не найден.` });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(500).send({ message: `Некорректные данные пользователя: ${err.message}` });
      } else {
        next(err);
      }
    });
};
