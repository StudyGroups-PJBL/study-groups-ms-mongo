import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudyGroup } from '../../../src/domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../src/domain/repositories/IStudyGroupRepository';
import { IGroupMessageRepository } from '../../../src/domain/repositories/IGroupMessageRepository';
import { CreateGroupHandler } from '../../../src/application/features/groups/create-group/CreateGroupHandler';
import { ListGroupsHandler } from '../../../src/application/features/groups/list-groups/ListGroupsHandler';
import { GetGroupByIdHandler } from '../../../src/application/features/groups/get-group-by-id/GetGroupByIdHandler';
import { UpdateGroupHandler } from '../../../src/application/features/groups/update-group/UpdateGroupHandler';
import { DeleteGroupHandler } from '../../../src/application/features/groups/delete-group/DeleteGroupHandler';

describe('StudyGroup Application Handlers', () => {
  let mockGroupRepo: IStudyGroupRepository;
  let mockMessageRepo: IGroupMessageRepository;

  beforeEach(() => {
    mockGroupRepo = {
      create: vi.fn(async (group: StudyGroup) => group),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(async (group: StudyGroup) => group),
      delete: vi.fn()
    };

    mockMessageRepo = {
      create: vi.fn(),
      findByGroupId: vi.fn(),
      findLatest: vi.fn(),
      findById: vi.fn(),
      deleteByGroupId: vi.fn()
    };
  });

  describe('CreateGroupHandler', () => {
    it('should validate input and create a new study group', async () => {
      const handler = new CreateGroupHandler(mockGroupRepo);

      const result = await handler.execute({
        name: 'Clean Architecture Group',
        subject: 'Software Engineering',
        description: 'Weekly architecture discussions'
      });

      expect(result).toBeInstanceOf(StudyGroup);
      expect(result.name).toBe('Clean Architecture Group');
      expect(result.subject).toBe('Software Engineering');
      expect(result.membersCount).toBe(1);
      expect(mockGroupRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid input via zod validation', async () => {
      const handler = new CreateGroupHandler(mockGroupRepo);

      await expect(
        handler.execute({
          name: 'AB',
          subject: ''
        })
      ).rejects.toThrow();

      expect(mockGroupRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('ListGroupsHandler', () => {
    it('should return all study groups and filter by subject when provided', async () => {
      const groups = [
        new StudyGroup({ name: 'NodeJS Study', subject: 'Backend' }),
        new StudyGroup({ name: 'React Study', subject: 'Frontend' })
      ];
      vi.mocked(mockGroupRepo.findAll).mockResolvedValue(groups);

      const handler = new ListGroupsHandler(mockGroupRepo);

      const allResult = await handler.execute();
      expect(allResult).toHaveLength(2);

      const filteredResult = await handler.execute({ subject: 'backend' });
      expect(filteredResult).toHaveLength(1);
      expect(filteredResult[0].name).toBe('NodeJS Study');
    });
  });

  describe('GetGroupByIdHandler', () => {
    it('should return a study group when found', async () => {
      const group = new StudyGroup({ id: 'group-1', name: 'DDD Study', subject: 'Architecture' });
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(group);

      const handler = new GetGroupByIdHandler(mockGroupRepo);
      const result = await handler.execute({ id: 'group-1' });

      expect(result.id).toBe('group-1');
    });

    it('should throw an error when study group is not found', async () => {
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(null);

      const handler = new GetGroupByIdHandler(mockGroupRepo);
      await expect(handler.execute({ id: 'missing-id' })).rejects.toThrow('StudyGroup not found.');
    });
  });

  describe('UpdateGroupHandler', () => {
    it('should update an existing study group', async () => {
      const existing = new StudyGroup({
        id: 'group-1',
        name: 'Old Name',
        subject: 'Math',
        description: 'Old desc',
        membersCount: 2
      });
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(existing);

      const handler = new UpdateGroupHandler(mockGroupRepo);
      const updated = await handler.execute({
        id: 'group-1',
        name: 'New Name',
        membersCount: 5
      });

      expect(updated.name).toBe('New Name');
      expect(updated.subject).toBe('Math');
      expect(updated.membersCount).toBe(5);
      expect(mockGroupRepo.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when updating a non-existent study group', async () => {
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(null);

      const handler = new UpdateGroupHandler(mockGroupRepo);
      await expect(
        handler.execute({
          id: 'missing-id',
          name: 'Updated Name'
        })
      ).rejects.toThrow('StudyGroup not found.');
    });
  });

  describe('DeleteGroupHandler', () => {
    it('should delete an existing study group and its messages', async () => {
      vi.mocked(mockGroupRepo.delete).mockResolvedValue(true);

      const handler = new DeleteGroupHandler(mockGroupRepo, mockMessageRepo);
      await handler.execute({ id: 'group-1' });

      expect(mockGroupRepo.delete).toHaveBeenCalledWith('group-1');
      expect(mockMessageRepo.deleteByGroupId).toHaveBeenCalledWith('group-1');
    });

    it('should throw an error when deleting a non-existent study group', async () => {
      vi.mocked(mockGroupRepo.delete).mockResolvedValue(false);

      const handler = new DeleteGroupHandler(mockGroupRepo, mockMessageRepo);
      await expect(handler.execute({ id: 'missing-id' })).rejects.toThrow('StudyGroup not found.');
    });
  });
});
