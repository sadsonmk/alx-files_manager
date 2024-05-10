const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect().catch((err) => console.error(err));
  }

  isAlive() {
    return this.client.topology.isConnected();
  }

  async nbUsers() {
    const collection = this.client.db().collection('users');
    const numberOfDocuments = await collection.countDocuments();
    return numberOfDocuments;
  }

  async nbFiles() {
    const collection = this.client.db().collection('files');
    const numberOfDocuments = await collection.countDocuments();
    return numberOfDocuments;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
