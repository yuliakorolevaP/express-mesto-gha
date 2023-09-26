const { celebrate, Joi } = require('celebrate');
const isUrl = require('validator/lib/isURL');
// eslint-disable-next-line import/no-unresolved
const BadRequest = require('../errors/BadRequest');

// eslint-disable-next-line consistent-return
const Url = (url) => {
  const validation = isUrl(url);
  if (validation) {
    return url;
  }
  throw new BadRequest('Некорректный адрес URL');
};

const validationLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validationCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(Url),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validationUpdateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
});

const validationUpdateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(Url),
  }),
});

const validationGetUserById = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
});

const validationCreateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().custom(Url),
  }),
});

const validationCard = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
});

module.exports = {
  validationLogin,
  validationCreateUser,
  validationUpdateUser,
  validationUpdateAvatar,
  validationGetUserById,
  validationCreateCard,
  validationCard,
};
