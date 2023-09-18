const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routerUsers = require('./routes/users');
const router = require('./routes/cards');

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

app.use((req, res, next) => {
  req.user = { _id: '6503ca52746a22d83a2ad3a6' };
  next();
});

app.get('/', (req, res) => {
  res.send('13 Проектная работа');
});
app.use('/', routerUsers);
app.use('/', router);
app.all('*', (req, res) => {
  res.status(404).send({ message: '404 страница не найдена' });
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
