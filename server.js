const express = require('express');

const PORT = process.env.PORT || 5000;
const app = express();

const bodyParser = require('body-parser');
const router = require('./routes/index');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
