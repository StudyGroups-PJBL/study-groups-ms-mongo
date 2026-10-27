import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectToDatabase(uri?: string): Promise<typeof mongoose> {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('A variável de ambiente MONGODB_URI não está definida.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const connection = await mongoose.connect(mongoUri);
  console.log('Conexão com o MongoDB estabelecida com sucesso.');
  return connection;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Conexão com o MongoDB encerrada.');
  }
}
