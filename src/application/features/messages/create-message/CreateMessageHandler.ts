import { z } from 'zod';
import { GroupMessage } from '../../../../domain/entities/GroupMessage';
import { IGroupMessageRepository } from '../../../../domain/repositories/IGroupMessageRepository';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const createMessageSchema = z.object({
  id: z.string().trim().min(1).optional(),
  groupId: z.string().trim().min(1, 'GroupMessage groupId is required.'),
  authorName: z.string().trim().min(1, 'GroupMessage authorName is required.'),
  content: z.string().trim().min(1, 'GroupMessage content is required.'),
  type: z.enum(['USER', 'SYSTEM_EVENT']).optional().default('USER')
});

export type CreateMessageInput = z.input<typeof createMessageSchema>;

export class CreateMessageHandler {
  constructor(
    private readonly groupMessageRepository: IGroupMessageRepository,
    private readonly studyGroupRepository?: IStudyGroupRepository
  ) {}

  public async execute(input: CreateMessageInput): Promise<GroupMessage> {
    const validated = createMessageSchema.parse(input);

    if (this.studyGroupRepository) {
      const group = await this.studyGroupRepository.findById(validated.groupId);
      if (!group) {
        throw new Error('StudyGroup not found.');
      }
    }

    const message = new GroupMessage({
      id: validated.id,
      groupId: validated.groupId,
      authorName: validated.authorName,
      content: validated.content,
      type: validated.type
    });

    return this.groupMessageRepository.create(message);
  }
}
