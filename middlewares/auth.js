const jwt = require('jsonwebtoken');
const Unauthorized = require('./Unauthorized');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Unauthorized('Неправильные почта или пароль');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'practicum2023');
  } catch (err) {
    throw new Unauthorized('Неправильные почта или пароль');
  }

  req.user = payload;

  next();
};
