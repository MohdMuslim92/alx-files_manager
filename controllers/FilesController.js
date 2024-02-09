// controllers/FilesController.js

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  async postUpload (req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve user based on token
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = '0', isPublic = false, data
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type or invalid type' });
    }

    if ((type !== 'folder' && !data) || (type === 'folder' && data)) {
      return res.status(400).json({ error: 'Missing data or invalid data' });
    }

    if (parentId !== '0') {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
      if (!parentFile || parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent not found or parent is not a folder' });
      }
    }

    const fileObject = {
      userId,
      name,
      type,
      isPublic,
      parentId
    };

    if (type !== 'folder') {
      const fileData = Buffer.from(data, 'base64');
      const filePath = path.join(FOLDER_PATH, `${uuidv4()}`);
      fs.writeFileSync(filePath, fileData);
      fileObject.localPath = filePath;
    }

    const result = await dbClient.db.collection('files').insertOne(fileObject);

    return res.status(201).json(result.ops[0]);
  }
};

export default FilesController;
