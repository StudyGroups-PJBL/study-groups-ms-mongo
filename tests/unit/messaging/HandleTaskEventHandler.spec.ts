import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupMessage } from '../../../src/domain/entities/GroupMessage';
import { IGroupMessageRepository } from '../../../src/domain/repositories/IGroupMessageRepository';
import {
  HandleTaskEventHandler,
  TaskStatusChangedEvent
} from '../../../src/application/features/messages/handle-task-event/HandleTaskEventHandler';

describe('HandleTaskEventHandler (Eventos Assíncronos do Quadro Kanban)', () => {
  let mockMessageRepo: IGroupMessageRepository;

  beforeEach(() => {
    mockMessageRepo = {
      create: vi.fn(async (msg: GroupMessage) => msg),
      findByGroupId: vi.fn(),
      findLatest: vi.fn(),
      findById: vi.fn(),
      deleteByGroupId: vi.fn()
    };
  });

  it('deve processar o evento TaskStatusChangedEvent e salvar uma GroupMessage do tipo SYSTEM_EVENT', async () => {
    const handler = new HandleTaskEventHandler(mockMessageRepo);

    const event: TaskStatusChangedEvent = {
      eventId: 'evt-1001',
      eventType: 'task.status.changed',
      occurredAt: '2026-10-27T18:30:00.000Z',
      payload: {
        taskId: 'tarefa-55',
        groupId: 'grupo-estudo-01',
        title: 'Implementar Consumidor RabbitMQ',
        oldStatus: 'EM_ANDAMENTO',
        newStatus: 'CONCLUIDA'
      }
    };

    const createdMessage = await handler.execute(event);

    expect(createdMessage).toBeInstanceOf(GroupMessage);
    expect(createdMessage.groupId).toBe('grupo-estudo-01');
    expect(createdMessage.authorName).toBe('Sistema Kanban');
    expect(createdMessage.type).toBe('SYSTEM_EVENT');
    expect(createdMessage.content).toBe(
      'A tarefa "Implementar Consumidor RabbitMQ" teve seu status alterado de "EM_ANDAMENTO" para "CONCLUIDA".'
    );
    expect(mockMessageRepo.create).toHaveBeenCalledTimes(1);
  });

  it('deve processar o formato de envelope publicado pelo study-groups-ms-sql (event, timestamp, data)', async () => {
    const handler = new HandleTaskEventHandler(mockMessageRepo);

    const createdMessage = await handler.execute({
      event: 'task.status.changed',
      timestamp: '2026-10-30T18:30:00.000Z',
      data: {
        taskId: 'c4b09f34-8d2a-4f10-9a1b-1e5a7f8c9d01',
        groupId: 'grupo-arquitetura-01',
        title: 'Resolver lista de arquitetura cloud',
        oldStatus: 'TODO',
        newStatus: 'DOING'
      }
    });

    expect(createdMessage).toBeInstanceOf(GroupMessage);
    expect(createdMessage.groupId).toBe('grupo-arquitetura-01');
    expect(createdMessage.authorName).toBe('Sistema Kanban');
    expect(createdMessage.type).toBe('SYSTEM_EVENT');
    expect(createdMessage.content).toBe(
      'A tarefa "Resolver lista de arquitetura cloud" teve seu status alterado de "TODO" para "DOING".'
    );
    expect(mockMessageRepo.create).toHaveBeenCalledTimes(1);
  });

  it('deve processar evento de criação de tarefa quando oldStatus for null', async () => {
    const handler = new HandleTaskEventHandler(mockMessageRepo);

    const createdMessage = await handler.execute({
      event: 'task.status.changed',
      timestamp: '2026-10-30T18:30:00.000Z',
      data: {
        taskId: 'c4b09f34-8d2a-4f10-9a1b-1e5a7f8c9d01',
        groupId: 'grupo-arquitetura-01',
        title: 'Nova tarefa Kanban',
        oldStatus: null,
        newStatus: 'TODO'
      }
    });

    expect(createdMessage.content).toBe(
      'A tarefa "Nova tarefa Kanban" foi criada no quadro Kanban com status "TODO".'
    );
    expect(mockMessageRepo.create).toHaveBeenCalledTimes(1);
  });

  it('deve rejeitar evento com payload incompleto ou inválido', async () => {
    const handler = new HandleTaskEventHandler(mockMessageRepo);

    await expect(
      handler.execute({
        eventId: '',
        eventType: 'task.status.changed',
        occurredAt: '2026-10-27T18:30:00.000Z',
        payload: {
          taskId: '',
          groupId: 'grupo-estudo-01',
          title: '',
          oldStatus: 'PENDENTE',
          newStatus: 'CONCLUIDA'
        }
      })
    ).rejects.toThrow();

    expect(mockMessageRepo.create).not.toHaveBeenCalled();
  });
});
