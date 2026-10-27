import dotenv from 'dotenv';
import { connectToDatabase } from '../infrastructure/database/mongodb';
import { app } from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

export async function startServer(): Promise<void> {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
