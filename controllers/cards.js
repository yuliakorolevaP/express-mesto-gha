const Card = require('../models/card');

module.exports.getCard = (req, res) => {
  Card.find({}).then((cards) => { res.send({ data: cards }); }).catch(() => { res.status(500).send({ message: 'Произошла ошибка' }); });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const user = req.user._id;
  Card.create({ name, link, owner: user })
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'Что-то пошло не так' });
    });
};

module.exports.deleteCard = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  Card.findById(req.params.cardId).then((cards) => {
    if (!cards) {
      return res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
    }
    cards.deleteOne().then(() => res.send({ message: `Карточка ${req.params.cardId} удалена` })).catch(next);
  })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Некорректные данные карточки' });
      } return res.status(500).send({ message: 'Что-то пошло не так' });
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  const user = req.user._id;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: user } },
    { new: true },
  )
    .orFail()
    .then((cards) => res.send({ data: cards }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
      }
      if (err.name === 'DocumentNotFoundError') {
        return res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.status(500).send({ message: 'Что-то пошло не так' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((cards) => res.send({ data: cards }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
      }
      if (err.name === 'DocumentNotFoundError') {
        return res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.status(500).send({ message: 'Что-то пошло не так' });
    });
};
