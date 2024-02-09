import Queue from 'bull';
import thumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

// Create a new queue for processing user jobs
const userQueue = new Queue('userQueue');

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.db.collection('users').findOne({ _id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});

// Export the userQueue instance
export { userQueue };

// Create a new queue for processing file jobs
const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.type !== 'image') {
    throw new Error('File is not an image');
  }

  const imageSizes = [500, 250, 100];

  const promises = imageSizes.map(async (size) => {
    const thumbnailData = await thumbnail(file.localPath, { width: size });
    const thumbnailPath = `${file.localPath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnailData);
  });

  await Promise.all(promises);
});

// Export the fileQueue instance
export default fileQueue;
