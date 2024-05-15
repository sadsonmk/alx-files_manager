const express = require('express');

const PORT = process.env.PORT || 5000;
const app = express();

const bodyParser = require('body-parser');
const routesController = require('./routes/index');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
routesController(app);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
