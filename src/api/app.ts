import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { IStudyGroupRepository } from '../domain/repositories/IStudyGroupRepository';
import { IGroupMessageRepository } from '../domain/repositories/IGroupMessageRepository';
import { MongoStudyGroupRepository } from '../infrastructure/persistence/MongoStudyGroupRepository';
import { MongoGroupMessageRepository } from '../infrastructure/persistence/MongoGroupMessageRepository';
import { createGroupRoutes } from './routes/groupRoutes';
import { createMessageRoutes } from './routes/messageRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { openapiSpec } from './docs/openapiSpec';
import { eventsDocsSpec, renderEventsDocsHtml } from './docs/eventsDocs';

export interface AppDependencies {
  studyGroupRepository?: IStudyGroupRepository;
  groupMessageRepository?: IGroupMessageRepository;
}

export function createApp(deps?: AppDependencies): Express {
  const app = express();

  const studyGroupRepository =
    deps?.studyGroupRepository ?? new MongoStudyGroupRepository();
  const groupMessageRepository =
    deps?.groupMessageRepository ?? new MongoGroupMessageRepository();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'operacional',
      service: 'study-groups-ms-mongo',
      message: 'Microsserviço de Grupos de Estudo e Mural de Mensagens ativo.',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.status(200).json(openapiSpec);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.get('/events-docs.json', (_req: Request, res: Response) => {
    res.status(200).json(eventsDocsSpec);
  });

  app.get('/events-docs', (_req: Request, res: Response) => {
    res.status(200).type('html').send(renderEventsDocsHtml());
  });

  app.use('/api/groups', createGroupRoutes(studyGroupRepository, groupMessageRepository));
  app.use('/api/messages', createMessageRoutes(groupMessageRepository));

  app.use(errorHandler);

  return app;
}

export const app = createApp();
