import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.connected = true;

    // Handle connection
    this.client.on('connect', () => {
      this.connected = true;
    });

    // Handle errors
    this.client.on('error', (err) => {
      console.error('Redis Error:', err);
      this.connected = false;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  async set(key, value, duration) {
    return this.client.set(key, value, 'EX', duration);
  }

  async del(key) {
    return this.client.del(key);
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
