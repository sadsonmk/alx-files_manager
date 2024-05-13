const fs = require('fs');
const path = require('path');
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

  let localPath = null;

  if (type === 'folder') {
    const folderPath = FOLDER_PATH;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filename = uuidv4();
    localPath = path.join(folderPath, filename);
    fs.writeFileSync(localPath, data, 'base64');
  }

  const newFile = {
    name,
    type,
    isPublic,
    parentId,
    userId: userId.toStirng(),
  };

  newFile.localPath = localPath;
  const result = await dbClient.client.db().collection('files').insertOne(newFile);
  newFile._id = result.insertedId;

  return res.status(201).json(newFile);
}

module.exports = {
  postUpload,
};
