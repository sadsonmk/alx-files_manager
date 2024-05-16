const dbClient = require('../utils/db');
const chai = require('chai');

describe('dbClient', () => {
  it('should be alive', () => {
    chai.expect(dbClient.isAlive()).toBe(true);
  });

  it('should insert and retrieve a document', async () => {
    const collection =  dbClient.client.db().collection('users');
    const documentDb = { name: 'testuser' }

    const result = await collection.insertOne(documentDb);
    const storedValue = await collection.findOne({ _id: result.insertedId });

    chai.expect(storedValue).toEqual(documentDb);
  });

});
