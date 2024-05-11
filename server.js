const express = require('express');

const PORT = process.env.PORT || 5000;
const app = express();

const routes = require('./routes/index');

app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
