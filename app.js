const { HTTP_STATUS_NOT_FOUND } = require('http2').constants;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { createUser, login } = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://0.0.0.0:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
}).then(() => {
  console.log('БД подключена');
}).catch(() => {
  console.log('Не удалось подключиться к БД');
});

app.post('/signin', login);
app.post('/signup', createUser);

// app.use((req, res, next) => {
//   req.user = { _id: '6503ca52746a22d83a2ad3a6' };
//   next();
// });

app.get('/', (req, res) => {
  res.send('13 Проектная работа');
});
app.use('/', routerUsers);
app.use('/', routerCards);
app.all('*', (req, res) => {
  res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Страница не найдена' });
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
