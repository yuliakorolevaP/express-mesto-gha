// eslint-disable-next-line import/no-unresolved
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');

const Card = require('../models/card');

module.exports.getCard = (req, res, next) => {
  Card.find({}).then((cards) => { res.send({ data: cards }); })
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId).then((card) => {
    if (!card) {
      throw new NotFound('Карточка с указанным _id не найдена');
    } if (!card.owner.equals(req.user._id)) {
      throw new Forbidden('Доступ запрещен');
    }
    card.deleteOne().then(() => res.send({ message: 'Карточка удалена' }));
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные'));
      } return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const user = req.user._id;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: user } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка с указанным _id не найдена');
      } res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные'));
      } return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка с указанным _id не найдена');
      } res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные'));
      } return next(err);
    });
};
