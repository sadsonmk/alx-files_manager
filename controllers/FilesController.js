const fs = require('fs');
const uuidv4 = require('uuid').v4;
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

async function postUpload(req, res) {
  const token = req.headers['x-token'];
  const {
    name, type, parentId = 0, isPublic = false, data,
  } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  const user = await dbClient.client.db().collection('users').findOne({ _id: userId });
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  if (!type || type !== 'folder' || type !== 'file' || type !== 'image') {
    return res.status(400).json({ error: 'Missing type' });
  }

  if (parentId !== 0) {
    const file = await dbClient.client.db().collection('files').findOne({ _id: parentId });
    if (!file) {
      return res.status(400).json({ error: 'Parent not found' });
    }
    if (file.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not a folder' });
    }
  }

  if (!data && type !== 'folder') {
    return res.status(400).json({ error: 'Missing data' });
  }

  const newFile = {
    userId: userId.toStirng(),
    name,
    type,
    isPublic,
    parentId,
  };

  if (type === 'folder') {
    const results = await dbClient.client.db().collection('files').insertOne(newFile);
    newFile._id = results.insertedId;
    return res.status(201).json(newFile);
  }

  const localPath = `${FOLDER_PATH}/${uuidv4()}`;
  fs.writeFile(localPath, data, { encoding: 'base64' });

  newFile.localPath = localPath;
  const result = await dbClient.client.db().collection('files').insertOne(newFile);
  newFile._id = result.insertedId;

  return res.status(201).json(newFile);
}

module.exports = {
  postUpload,
};
