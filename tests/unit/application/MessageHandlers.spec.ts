import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudyGroup } from '../../../src/domain/entities/StudyGroup';
import { GroupMessage } from '../../../src/domain/entities/GroupMessage';
import { IStudyGroupRepository } from '../../../src/domain/repositories/IStudyGroupRepository';
import { IGroupMessageRepository } from '../../../src/domain/repositories/IGroupMessageRepository';
import { CreateMessageHandler } from '../../../src/application/features/messages/create-message/CreateMessageHandler';
import { ListGroupMessagesHandler } from '../../../src/application/features/messages/list-group-messages/ListGroupMessagesHandler';

describe('Handlers de Aplicação para o Mural de Mensagens', () => {
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
    it('deve criar uma mensagem no mural para um grupo de estudo existente', async () => {
      const group = new StudyGroup({
        id: 'grupo-1',
        name: 'Grupo de DDD',
        subject: 'Arquitetura de Software'
      });
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(group);

      const handler = new CreateMessageHandler(mockMessageRepo, mockGroupRepo);
      const message = await handler.execute({
        groupId: 'grupo-1',
        authorName: 'Lara Bredow',
        content: 'Vamos revisar os capítulos de Arquitetura Limpa hoje!'
      });

      expect(message).toBeInstanceOf(GroupMessage);
      expect(message.groupId).toBe('grupo-1');
      expect(message.authorName).toBe('Lara Bredow');
      expect(message.type).toBe('USER');
      expect(mockMessageRepo.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro caso o grupo de estudo informado não exista', async () => {
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(null);

      const handler = new CreateMessageHandler(mockMessageRepo, mockGroupRepo);
      await expect(
        handler.execute({
          groupId: 'grupo-inexistente',
          authorName: 'Lara Bredow',
          content: 'Olá equipe!'
        })
      ).rejects.toThrow('Grupo de estudo não encontrado.');

      expect(mockMessageRepo.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar payload de mensagem inválido via validação Zod', async () => {
      const handler = new CreateMessageHandler(mockMessageRepo);
      await expect(
        handler.execute({
          groupId: 'grupo-1',
          authorName: '',
          content: ''
        })
      ).rejects.toThrow();
    });
  });

  describe('ListGroupMessagesHandler', () => {
    it('deve listar as mensagens filtradas por groupId quando informado', async () => {
      const messages = [
        new GroupMessage({
          groupId: 'grupo-1',
          authorName: 'Viktor Trawinski',
          content: 'Primeira publicação no mural do grupo 1'
        })
      ];
      vi.mocked(mockMessageRepo.findByGroupId).mockResolvedValue(messages);

      const handler = new ListGroupMessagesHandler(mockMessageRepo);
      const result = await handler.execute({ groupId: 'grupo-1' });

      expect(result).toHaveLength(1);
      expect(mockMessageRepo.findByGroupId).toHaveBeenCalledWith('grupo-1');
      expect(mockMessageRepo.findLatest).not.toHaveBeenCalled();
    });

    it('deve listar as últimas mensagens gerais quando groupId não for informado', async () => {
      const messages = [
        new GroupMessage({
          groupId: 'grupo-1',
          authorName: 'João Gabriel Cintra',
          content: 'Mensagem geral no mural de estudos'
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
