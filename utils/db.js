import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${DB_HOST}:${DB_PORT}`;

    this.host = DB_HOST;
    this.port = DB_PORT;
    this.database = DB_DATABASE;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.collectionUsers = null;
    this.collectionFiles = null;
  }

  async connect() {
    try {
      await this.client.connect();
      const db = this.client.db(this.database);
      this.collectionUsers = db.collection('users');
      this.collectionFiles = db.collection('files');
      console.log('DB connection established successfully');
    } catch (error) {
      console.error('Error connecting to DB:', error);
    }
  }

  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      const count = await this.collectionUsers.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      return -1;
    }
  }

  async nbFiles() {
    try {
      const count = await this.collectionFiles.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      return -1;
    }
  }
}

const dbClient = new DBClient();
dbClient.connect(); // Connect to the database when the module is imported

export default dbClient;
