// eslint-disable-next-line import/no-unresolved
const BadRequest = require('../middlewares/Badrequest');
const InternalServerError = require('../middlewares/InternalServerError');
const NotFound = require('../middlewares/NotFound');
const Forbidden = require('../middlewares/Forbidden');
const Card = require('../models/card');

module.exports.getCard = (req, res) => {
  Card.find({}).then((cards) => { res.send({ data: cards }); })
    .catch(() => new InternalServerError('На сервере произошла ошибка'));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные');
      }
      throw new InternalServerError('На сервере произошла ошибка');
    });
};

module.exports.deleteCard = (req, res) => {
  // eslint-disable-next-line consistent-return
  Card.findById(req.params.cardId).then((card) => {
    if (!card) {
      throw new NotFound('Карточка с указанным _id не найдена.');
    } if (!card.owner.equals(req.user._id)) {
      throw new Forbidden('Доступ запрещен');
    }
    card.deleteOne().then(() => res.send({ message: 'Карточка удалена' }));
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные');
      } throw new InternalServerError('На сервере произошла ошибка');
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
        throw new BadRequest('Переданы некорректные данные');
      }
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFound('Карточка с указанным _id не найдена.');
      }
      throw new InternalServerError('На сервере произошла ошибка');
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
        throw new BadRequest('Переданы некорректные данные');
      }
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFound('Карточка с указанным _id не найдена.');
      }
      throw new InternalServerError('На сервере произошла ошибка');
    });
};
