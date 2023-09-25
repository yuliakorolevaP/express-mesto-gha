const router = require('express').Router();

const {
  getCard,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const {
  validationCreateCard,
  validationCard,
} = require('../middlewares/validation');

router.get('/cards', getCard);

router.post('/cards', validationCreateCard, createCard);

router.delete('/cards/:cardId', validationCard, deleteCard);

router.put('/cards/:cardId/likes', validationCard, likeCard);

router.delete('/cards/:cardId/likes', validationCard, dislikeCard);

module.exports = router;
