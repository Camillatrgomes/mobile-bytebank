const mongoose = require('mongoose');

async function connectDB() {
  try {
    if (process.env.MONGO_URI) {
      // Conectar ao MongoDB real (Atlas) em produção / Firebase
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Conectado ao MongoDB Real');
    } else {
      // Apenas importa o memory server dinamicamente em desenvolvimento
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('Conectado ao MongoDB em memória (Dev)');
    }
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  }
}

module.exports = connectDB;