import RedisClient from '../../utils/redis';

describe('RedisClient', () => {
  const redis = new RedisClient();

  test('isAlive() returns true when connected', () => {
    expect(redis.isAlive()).toBe(true);
  });

  test('set() and get() methods work correctly', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await redis.set(key, value, 10);
    const retrievedValue = await redis.get(key);

    expect(retrievedValue).toBe(value);
  });

  test('del() method works correctly', async () => {
    const key = 'testKey';

    await redis.del(key);
    const retrievedValue = await redis.get(key);

    expect(retrievedValue).toBeNull();
  });
});
