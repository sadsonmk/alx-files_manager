const uuidv4 = require('uuid').v4;
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

async function getConnect(req, res) {
  const authHeader = req.header('Authorization') || '';

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

  const token = uuidv4().toString();
  const key = `auth_${token}`;
  const duration = (24 * 60 * 60);
  await redisClient.set(key, user._id.toString(), duration);
  return res.status(200).json({ token });
}

async function getDisconnect(req, res) {
  const token = req.headers['x-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;
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
