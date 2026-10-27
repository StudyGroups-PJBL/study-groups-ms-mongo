import { z } from 'zod';
import { GroupMessage } from '../../../../domain/entities/GroupMessage';
import { IGroupMessageRepository } from '../../../../domain/repositories/IGroupMessageRepository';

export const taskStatusChangedEventSchema = z.object({
  eventId: z.string().trim().min(1, 'O identificador do evento é obrigatório.'),
  eventType: z.string().trim().min(1, 'O tipo do evento é obrigatório.'),
  occurredAt: z.string().trim().min(1, 'A data de ocorrência do evento é obrigatória.'),
  payload: z.object({
    taskId: z.string().trim().min(1, 'O identificador da tarefa é obrigatório.'),
    groupId: z.string().trim().min(1, 'O identificador do grupo é obrigatório.'),
    title: z.string().trim().min(1, 'O título da tarefa é obrigatório.'),
    oldStatus: z.string().trim().min(1, 'O status anterior da tarefa é obrigatório.'),
    newStatus: z.string().trim().min(1, 'O novo status da tarefa é obrigatório.')
  })
});

export type TaskStatusChangedEvent = z.infer<typeof taskStatusChangedEventSchema>;

export class HandleTaskEventHandler {
  constructor(private readonly groupMessageRepository: IGroupMessageRepository) {}

  public async execute(event: TaskStatusChangedEvent): Promise<GroupMessage> {
    const validated = taskStatusChangedEventSchema.parse(event);
    const { groupId, title, oldStatus, newStatus } = validated.payload;

    const content = `A tarefa "${title}" teve seu status alterado de "${oldStatus}" para "${newStatus}".`;

    const systemMessage = new GroupMessage({
      groupId,
      authorName: 'Sistema Kanban',
      content,
      type: 'SYSTEM_EVENT'
    });

    return this.groupMessageRepository.create(systemMessage);
  }
}
