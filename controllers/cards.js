const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_NOT_FOUND } = require('http2').constants;
const Card = require('../models/card');

module.exports.getCard = (req, res) => {
  Card.find({}).then((cards) => { res.send({ data: cards }); })
    .catch(() => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const user = req.user._id;
  Card.create({ name, link, owner: user })
    .then((cards) => {
      res.status(200).res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      }
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
};

module.exports.deleteCard = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  Card.findById(req.params.cardId).then((card) => {
    if (!card) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
    } if (!card.owner.equals(req.user._id)) {
      res.status(403).send({ message: 'Доступ запрещен' });
    }
    card.deleteOne().then(() => res.status(200).res.send({ message: `Карточка ${req.params.cardId} удалена` })).catch(next);
  })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      } return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
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
    .then((cards) => res.status(200).res.send({ data: cards }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      }
      if (err.name === 'DocumentNotFoundError') {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((cards) => res.status(200).res.send({ data: cards }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      }
      if (err.name === 'DocumentNotFoundError') {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
};
