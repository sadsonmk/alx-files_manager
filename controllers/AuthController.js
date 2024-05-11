const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

async function getConnect(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [authType, authString] = authHeader.split(' ');
  if (authType !== 'Basic' || !authString) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [email, password] = Buffer.from(authString, 'base64').toString().split(':');
  const hashedPswd = sha1(password);

  const user = await dbClient.client.db().collection('users').findOne({ email, password: hashedPswd });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuidv4();
  const key = `auth_${token}`;
  await redisClient.set(key, user._id.toString(), 24 * 60 * 60);
  return res.status(200).json({ token });
}

async function getDisconnect(req, res) {
  const xToken = req.headers['x-token'];

  if (!xToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${xToken}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(key);
  return res.status(204).end();
}

module.exports = {
  getConnect,
  getDisconnect,
};
