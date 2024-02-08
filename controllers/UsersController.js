import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = { email, password: hashedPassword };

    const result = await dbClient.db.collection('users').insertOne(newUser);

    return res.status(201).json({ id: result.insertedId, email });
  },

  async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await dbClient.db.collection('users').findOne({ _id: userId });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { email, _id } = user;
      return res.status(200).json({ email, id: _id });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default UsersController;
