const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid').v4;
const { ObjectId } = require('mongodb');
const { promisify } = require('util');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const writeFilePromise = promisify(fs.writeFile);
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
  const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  if (!type || !['folder', 'file', 'image'].includes(type)) {
    return res.status(400).json({ error: 'Missing type' });
  }

  if (parentId !== 0) {
    const file = await dbClient.client.db().collection('files').findOne({ parentId });
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
    name,
    type,
    isPublic,
    parentId,
    userId,
  };

  if (type === 'folder') {
    const result = await dbClient.client.db().collection('files').insertOne(newFile);
    newFile.id = result.insertedId;
    return res.status(201).json(newFile);
  }

  const filename = uuidv4();
  const localPath = path.join(FOLDER_PATH, filename);
  writeFilePromise(localPath, data, { encoding: 'base64' })
    .then(async () => {
      newFile.localPath = localPath;
      const result = await dbClient.client.db().collection('files').insertOne(newFile);
      newFile.id = result.insertedId;
      return res.status(201).json(newFile);
    })
    .catch((err) => res.status(500).json({ error: err.messge }));
  return res.status(201);
}

module.exports = {
  postUpload,
};
