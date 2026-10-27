import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudyGroup } from '../../../src/domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../src/domain/repositories/IStudyGroupRepository';
import { IGroupMessageRepository } from '../../../src/domain/repositories/IGroupMessageRepository';
import { CreateGroupHandler } from '../../../src/application/features/groups/create-group/CreateGroupHandler';
import { ListGroupsHandler } from '../../../src/application/features/groups/list-groups/ListGroupsHandler';
import { GetGroupByIdHandler } from '../../../src/application/features/groups/get-group-by-id/GetGroupByIdHandler';
import { UpdateGroupHandler } from '../../../src/application/features/groups/update-group/UpdateGroupHandler';
import { DeleteGroupHandler } from '../../../src/application/features/groups/delete-group/DeleteGroupHandler';

describe('Handlers de Aplicação para Grupos de Estudo', () => {
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
    it('deve validar os dados de entrada e criar um novo grupo de estudo', async () => {
      const handler = new CreateGroupHandler(mockGroupRepo);

      const result = await handler.execute({
        name: 'Grupo de Estudos de Arquitetura Limpa',
        subject: 'Engenharia de Software',
        description: 'Discussões semanais sobre arquitetura e microsserviços'
      });

      expect(result).toBeInstanceOf(StudyGroup);
      expect(result.name).toBe('Grupo de Estudos de Arquitetura Limpa');
      expect(result.subject).toBe('Engenharia de Software');
      expect(result.membersCount).toBe(1);
      expect(mockGroupRepo.create).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar dados inválidos através da validação do Zod', async () => {
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
    it('deve retornar todos os grupos e permitir filtragem por assunto', async () => {
      const groups = [
        new StudyGroup({ name: 'Estudos de Node.js', subject: 'Desenvolvimento Backend' }),
        new StudyGroup({ name: 'Estudos de React', subject: 'Desenvolvimento Frontend' })
      ];
      vi.mocked(mockGroupRepo.findAll).mockResolvedValue(groups);

      const handler = new ListGroupsHandler(mockGroupRepo);

      const allResult = await handler.execute();
      expect(allResult).toHaveLength(2);

      const filteredResult = await handler.execute({ subject: 'backend' });
      expect(filteredResult).toHaveLength(1);
      expect(filteredResult[0].name).toBe('Estudos de Node.js');
    });
  });

  describe('GetGroupByIdHandler', () => {
    it('deve retornar o grupo de estudo quando encontrado pelo identificador', async () => {
      const group = new StudyGroup({
        id: 'grupo-1',
        name: 'Grupo de DDD',
        subject: 'Arquitetura de Software'
      });
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(group);

      const handler = new GetGroupByIdHandler(mockGroupRepo);
      const result = await handler.execute({ id: 'grupo-1' });

      expect(result.id).toBe('grupo-1');
    });

    it('deve lançar erro quando o grupo de estudo não for encontrado', async () => {
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(null);

      const handler = new GetGroupByIdHandler(mockGroupRepo);
      await expect(handler.execute({ id: 'id-inexistente' })).rejects.toThrow(
        'Grupo de estudo não encontrado.'
      );
    });
  });

  describe('UpdateGroupHandler', () => {
    it('deve atualizar os dados de um grupo de estudo existente', async () => {
      const existing = new StudyGroup({
        id: 'grupo-1',
        name: 'Nome Antigo',
        subject: 'Matemática',
        description: 'Descrição antiga',
        membersCount: 2
      });
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(existing);

      const handler = new UpdateGroupHandler(mockGroupRepo);
      const updated = await handler.execute({
        id: 'grupo-1',
        name: 'Nome Atualizado',
        membersCount: 5
      });

      expect(updated.name).toBe('Nome Atualizado');
      expect(updated.subject).toBe('Matemática');
      expect(updated.membersCount).toBe(5);
      expect(mockGroupRepo.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro ao tentar atualizar um grupo de estudo inexistente', async () => {
      vi.mocked(mockGroupRepo.findById).mockResolvedValue(null);

      const handler = new UpdateGroupHandler(mockGroupRepo);
      await expect(
        handler.execute({
          id: 'id-inexistente',
          name: 'Nome Atualizado'
        })
      ).rejects.toThrow('Grupo de estudo não encontrado.');
    });
  });

  describe('DeleteGroupHandler', () => {
    it('deve remover um grupo de estudo existente e excluir as mensagens do seu mural', async () => {
      vi.mocked(mockGroupRepo.delete).mockResolvedValue(true);

      const handler = new DeleteGroupHandler(mockGroupRepo, mockMessageRepo);
      await handler.execute({ id: 'grupo-1' });

      expect(mockGroupRepo.delete).toHaveBeenCalledWith('grupo-1');
      expect(mockMessageRepo.deleteByGroupId).toHaveBeenCalledWith('grupo-1');
    });

    it('deve lançar erro ao tentar remover um grupo de estudo inexistente', async () => {
      vi.mocked(mockGroupRepo.delete).mockResolvedValue(false);

      const handler = new DeleteGroupHandler(mockGroupRepo, mockMessageRepo);
      await expect(handler.execute({ id: 'id-inexistente' })).rejects.toThrow(
        'Grupo de estudo não encontrado.'
      );
    });
  });
});
