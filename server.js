const express = require('express');

const PORT = process.env.PORT || 5000;
const app = express();

const router = require('./routes/index');

app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
