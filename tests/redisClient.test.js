const redisClient = require('../utils/redis');
const chai = require('chai');

describe('redisClient', () => {
  it('should be alive', () => {
    chai.expect(redisClient.isAlive()).toBe(true);
  });

  it('should get and set a value', async () => {
    const key = 'test_key';
    const value = 'test_value';

    await rediClient.set(key, value, 3600);
    const storedValue = await redisClient.get(key);

    chai.expect(storedValue).toBe(value);
  });

  it('should delete a set value', async () => {
    const key = 'test_key';
    const value = 'test_value';

    await rediClient.set(key, value, 3600);
    await redisClient.del(key);
    const storedValue = await redisClient.get(key);

    chai.expect(storedValue).toBeNull(value);
});
