const express = require('express');

const PORT = process.env.PORT || 5000;
const app = express();

const routes = require('./routes/index');
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
