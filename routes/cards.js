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
  validationCardId,
} = require('../middlewares/validation');

router.get('/cards', getCard);

router.post('/cards', validationCreateCard, createCard);

router.delete('/cards/:cardId', validationCardId, deleteCard);

router.put('/cards/:cardId/likes', validationCardId, likeCard);

router.delete('/cards/:cardId/likes', validationCardId, dislikeCard);

module.exports = router;
