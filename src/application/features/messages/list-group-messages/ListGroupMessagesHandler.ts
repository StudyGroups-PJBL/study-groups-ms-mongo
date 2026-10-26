import { z } from 'zod';
import { GroupMessage } from '../../../../domain/entities/GroupMessage';
import { IGroupMessageRepository } from '../../../../domain/repositories/IGroupMessageRepository';

export const listGroupMessagesSchema = z
  .object({
    groupId: z.string().trim().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional().default(50)
  })
  .optional();

export type ListGroupMessagesInput = z.input<typeof listGroupMessagesSchema>;

export class ListGroupMessagesHandler {
  constructor(private readonly groupMessageRepository: IGroupMessageRepository) {}

  public async execute(input?: ListGroupMessagesInput): Promise<GroupMessage[]> {
    const validated = listGroupMessagesSchema.parse(input);

    if (validated?.groupId) {
      return this.groupMessageRepository.findByGroupId(validated.groupId);
    }

    return this.groupMessageRepository.findLatest(validated?.limit ?? 50);
  }
}
