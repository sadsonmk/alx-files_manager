const sha1 = require('sha1');
const dbClient = require('../utils/db');

async function postNew(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const emailExists = await dbClient.client.db().collection('users').findOne({ email });

  if (emailExists) {
    return res.status(400).json({ error: 'Already exist' });
  }

  const hashedPswd = sha1(password);
  const newUser = await dbClient.client.db().collection('users').insertOne({ email, password: hashedPswd });
  return res.status(201).json({ id: newUser._id, email });
}

module.exports = {
  postNew,
};
