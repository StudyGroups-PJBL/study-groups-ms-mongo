import dotenv from 'dotenv';
import { connectToDatabase } from '../infrastructure/database/mongodb';
import { MongoGroupMessageRepository } from '../infrastructure/persistence/MongoGroupMessageRepository';
import { HandleTaskEventHandler } from '../application/features/messages/handle-task-event/HandleTaskEventHandler';
import { RabbitMqConsumer } from '../infrastructure/messaging/RabbitMqConsumer';
import { app } from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

export async function startServer(): Promise<void> {
  await connectToDatabase();

  const groupMessageRepository = new MongoGroupMessageRepository();
  const handleTaskEventHandler = new HandleTaskEventHandler(groupMessageRepository);
  const rabbitMqConsumer = new RabbitMqConsumer(handleTaskEventHandler);

  app.listen(PORT, () => {
    console.log(`Servidor HTTP em execução na porta ${PORT}.`);
  });

  await rabbitMqConsumer.start();
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Falha crítica ao inicializar o servidor:', err);
    process.exit(1);
  });
}
