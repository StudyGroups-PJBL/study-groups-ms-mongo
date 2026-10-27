import { Router, Request, Response, NextFunction } from 'express';
import { IStudyGroupRepository } from '../../domain/repositories/IStudyGroupRepository';
import { IGroupMessageRepository } from '../../domain/repositories/IGroupMessageRepository';
import { CreateGroupHandler } from '../../application/features/groups/create-group/CreateGroupHandler';
import { ListGroupsHandler } from '../../application/features/groups/list-groups/ListGroupsHandler';
import { GetGroupByIdHandler } from '../../application/features/groups/get-group-by-id/GetGroupByIdHandler';
import { UpdateGroupHandler } from '../../application/features/groups/update-group/UpdateGroupHandler';
import { DeleteGroupHandler } from '../../application/features/groups/delete-group/DeleteGroupHandler';
import { CreateMessageHandler } from '../../application/features/messages/create-message/CreateMessageHandler';
import { ListGroupMessagesHandler } from '../../application/features/messages/list-group-messages/ListGroupMessagesHandler';

export function createGroupRoutes(
  studyGroupRepository: IStudyGroupRepository,
  groupMessageRepository: IGroupMessageRepository
): Router {
  const router = Router();

  const createGroupHandler = new CreateGroupHandler(studyGroupRepository);
  const listGroupsHandler = new ListGroupsHandler(studyGroupRepository);
  const getGroupByIdHandler = new GetGroupByIdHandler(studyGroupRepository);
  const updateGroupHandler = new UpdateGroupHandler(studyGroupRepository);
  const deleteGroupHandler = new DeleteGroupHandler(studyGroupRepository, groupMessageRepository);
  const createMessageHandler = new CreateMessageHandler(
    groupMessageRepository,
    studyGroupRepository
  );
  const listGroupMessagesHandler = new ListGroupMessagesHandler(groupMessageRepository);

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const group = await createGroupHandler.execute(req.body);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subject = typeof req.query.subject === 'string' ? req.query.subject : undefined;
      const groups = await listGroupsHandler.execute({ subject });
      res.status(200).json(groups);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const group = await getGroupByIdHandler.execute({ id: String(req.params.id) });
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const group = await updateGroupHandler.execute({
        ...req.body,
        id: String(req.params.id)
      });
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteGroupHandler.execute({ id: String(req.params.id) });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.post('/:groupId/messages', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await createMessageHandler.execute({
        ...req.body,
        groupId: String(req.params.groupId)
      });
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:groupId/messages', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await listGroupMessagesHandler.execute({
        groupId: String(req.params.groupId)
      });
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
