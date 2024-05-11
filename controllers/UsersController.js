const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

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
  return res.status(201).json({ id: newUser.insertedId, email });
}

async function getMe(req, res) {
  const xToken = req.headers['x-token'];
  if (!xToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${xToken}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await dbClient.client.db().collection('users').findOne({ _id: userId });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({ id: user._id, email: user.email });
}

module.exports = {
  postNew,
  getMe,
};
