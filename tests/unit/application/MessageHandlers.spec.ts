import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudyGroup } from '../../../src/domain/entities/StudyGroup';
import { GroupMessage } from '../../../src/domain/entities/GroupMessage';
import { IStudyGroupRepository } from '../../../src/domain/repositories/IStudyGroupRepository';
import { IGroupMessageRepository } from '../../../src/domain/repositories/IGroupMessageRepository';
import { CreateMessageHandler } from '../../../src/application/features/messages/create-message/CreateMessageHandler';
import { ListGroupMessagesHandler } from '../../../src/application/features/messages/list-group-messages/ListGroupMessagesHandler';

describe('GroupMessage Application Handlers', () => {
  let mockMessageRepo: IGroupMessageRepository;
  let mockGroupRepo: IStudyGroupRepository;

  beforeEach(() => {
    mockMessageRepo = {
      create: vi.fn(async (msg: GroupMessage) => msg),
      findByGroupId: vi.fn(),
      findLatest: vi.fn(),
      findById: vi.fn(),
      deleteByGroupId: vi.fn()
    };

    mockGroupRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
  });

  describe('CreateMessageHandler', () => {
    it('should create a message for an existing study group', async () => {
      const group = new StudyGroup({ id: 'group-1', name: 'DDD Group', subject: 'Architecture' });
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(group);

      const handler = new CreateMessageHandler(mockMessageRepo, mockGroupRepo);
      const message = await handler.execute({
        groupId: 'group-1',
        authorName: 'Lara',
        content: 'Let us review Clean Architecture chapters!'
      });

      expect(message).toBeInstanceOf(GroupMessage);
      expect(message.groupId).toBe('group-1');
      expect(message.authorName).toBe('Lara');
      expect(message.type).toBe('USER');
      expect(mockMessageRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the target study group does not exist', async () => {
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(null);

      const handler = new CreateMessageHandler(mockMessageRepo, mockGroupRepo);
      await expect(
        handler.execute({
          groupId: 'non-existent',
          authorName: 'Lara',
          content: 'Hello'
        })
      ).rejects.toThrow('StudyGroup not found.');

      expect(mockMessageRepo.create).not.toHaveBeenCalled();
    });

    it('should reject invalid message payload via zod', async () => {
      const handler = new CreateMessageHandler(mockMessageRepo);
      await expect(
        handler.execute({
          groupId: 'group-1',
          authorName: '',
          content: ''
        })
      ).rejects.toThrow();
    });
  });

  describe('ListGroupMessagesHandler', () => {
    it('should list messages by groupId when groupId is provided', async () => {
      const messages = [
        new GroupMessage({
          groupId: 'group-1',
          authorName: 'Viktor',
          content: 'First post in group 1'
        })
      ];
      vi.mocked(mockMessageRepo.findByGroupId).mockResolvedValue(messages);

      const handler = new ListGroupMessagesHandler(mockMessageRepo);
      const result = await handler.execute({ groupId: 'group-1' });

      expect(result).toHaveLength(1);
      expect(mockMessageRepo.findByGroupId).toHaveBeenCalledWith('group-1');
      expect(mockMessageRepo.findLatest).not.toHaveBeenCalled();
    });

    it('should list latest general messages when groupId is not provided', async () => {
      const messages = [
        new GroupMessage({
          groupId: 'group-1',
          authorName: 'João',
          content: 'General board message'
        })
      ];
      vi.mocked(mockMessageRepo.findLatest).mockResolvedValue(messages);

      const handler = new ListGroupMessagesHandler(mockMessageRepo);
      const result = await handler.execute({ limit: 10 });

      expect(result).toHaveLength(1);
      expect(mockMessageRepo.findLatest).toHaveBeenCalledWith(10);
      expect(mockMessageRepo.findByGroupId).not.toHaveBeenCalled();
    });
  });
});
