import { z } from 'zod';
import { GroupMessage } from '../../../../domain/entities/GroupMessage';
import { IGroupMessageRepository } from '../../../../domain/repositories/IGroupMessageRepository';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const createMessageSchema = z.object({
  id: z.string().trim().min(1, 'O identificador da mensagem não pode ser vazio.').optional(),
  groupId: z.string().trim().min(1, 'O identificador do grupo é obrigatório.'),
  authorName: z.string().trim().min(1, 'O nome do autor é obrigatório.'),
  content: z.string().trim().min(1, 'O conteúdo da mensagem é obrigatório.'),
  type: z
    .enum(['USER', 'SYSTEM_EVENT'], {
      message: 'O tipo da mensagem deve ser USER ou SYSTEM_EVENT.'
    })
    .optional()
    .default('USER')
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
        throw new Error('Grupo de estudo não encontrado.');
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
