import { Router, Request, Response, NextFunction } from 'express';
import { IGroupMessageRepository } from '../../domain/repositories/IGroupMessageRepository';
import { ListGroupMessagesHandler } from '../../application/features/messages/list-group-messages/ListGroupMessagesHandler';

export function createMessageRoutes(groupMessageRepository: IGroupMessageRepository): Router {
  const router = Router();
  const listGroupMessagesHandler = new ListGroupMessagesHandler(groupMessageRepository);

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const groupId = typeof req.query.groupId === 'string' ? req.query.groupId : undefined;
      const messages = await listGroupMessagesHandler.execute({ groupId, limit });
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
