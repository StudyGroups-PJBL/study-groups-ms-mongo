import { z } from 'zod';
import { GroupMessage } from '../../../../domain/entities/GroupMessage';
import { IGroupMessageRepository } from '../../../../domain/repositories/IGroupMessageRepository';

const taskPayloadSchema = z.object({
  taskId: z.string().trim().min(1, 'O identificador da tarefa é obrigatório.'),
  groupId: z.string().trim().min(1, 'O identificador do grupo é obrigatório.'),
  title: z.string().trim().min(1, 'O título da tarefa é obrigatório.'),
  oldStatus: z
    .string()
    .trim()
    .min(1, 'O status anterior da tarefa é obrigatório.')
    .nullable()
    .optional(),
  newStatus: z.string().trim().min(1, 'O novo status da tarefa é obrigatório.')
});

export const taskStatusChangedEventSchema = z
  .object({
    eventId: z.string().trim().min(1, 'O identificador do evento é obrigatório.').optional(),
    eventType: z.string().trim().min(1, 'O tipo do evento é obrigatório.').optional(),
    event: z.string().trim().min(1, 'O tipo do evento é obrigatório.').optional(),
    occurredAt: z.string().trim().min(1, 'A data de ocorrência do evento é obrigatória.').optional(),
    timestamp: z.string().trim().min(1, 'A data de ocorrência do evento é obrigatória.').optional(),
    payload: taskPayloadSchema.optional(),
    data: taskPayloadSchema.optional()
  })
  .refine((val) => Boolean(val.payload || val.data), {
    message: 'Os dados do evento da tarefa (payload ou data) são obrigatórios.'
  });

export type TaskStatusChangedEvent = z.input<typeof taskStatusChangedEventSchema>;

export class HandleTaskEventHandler {
  constructor(private readonly groupMessageRepository: IGroupMessageRepository) {}

  public async execute(event: TaskStatusChangedEvent): Promise<GroupMessage> {
    const validated = taskStatusChangedEventSchema.parse(event);
    const taskData = (validated.payload ?? validated.data)!;
    const { groupId, title, oldStatus, newStatus } = taskData;

    const content = oldStatus
      ? `A tarefa "${title}" teve seu status alterado de "${oldStatus}" para "${newStatus}".`
      : `A tarefa "${title}" foi criada no quadro Kanban com status "${newStatus}".`;

    const systemMessage = new GroupMessage({
      groupId,
      authorName: 'Sistema Kanban',
      content,
      type: 'SYSTEM_EVENT'
    });

    return this.groupMessageRepository.create(systemMessage);
  }
}
