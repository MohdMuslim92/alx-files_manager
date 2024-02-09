import dbClient from '../../utils/db';

describe('DBClient', () => {
  test('isAlive() returns true when connected', () => {
    expect(dbClient.isAlive()).toBe(true);
  });

  test('nbUsers() method returns a number', async () => {
    const usersCount = await dbClient.nbUsers();

    expect(typeof usersCount).toBe('number');
  });

  test('nbFiles() method returns a number', async () => {
    const filesCount = await dbClient.nbFiles();

    expect(typeof filesCount).toBe('number');
  });
});
