import { describe, it, expect } from 'vitest';
import { GroupMessage } from '../../../src/domain/entities/GroupMessage';

describe('Entidade GroupMessage (Mensagem do Mural)', () => {
  it('deve criar uma mensagem válida do tipo USER', () => {
    const message = new GroupMessage({
      groupId: 'grupo-123',
      authorName: 'Lara Bredow',
      content: 'Olá pessoal! Prontos para a revisão de arquitetura hoje?'
    });

    expect(message.id).toBeDefined();
    expect(message.groupId).toBe('grupo-123');
    expect(message.authorName).toBe('Lara Bredow');
    expect(message.content).toBe('Olá pessoal! Prontos para a revisão de arquitetura hoje?');
    expect(message.type).toBe('USER');
    expect(message.createdAt).toBeInstanceOf(Date);
  });

  it('deve criar uma mensagem válida do tipo SYSTEM_EVENT', () => {
    const message = new GroupMessage({
      id: 'msg-001',
      groupId: 'grupo-123',
      authorName: 'Sistema Kanban',
      content: 'A tarefa "Modelar Banco MongoDB" mudou de status para Concluída.',
      type: 'SYSTEM_EVENT'
    });

    expect(message.id).toBe('msg-001');
    expect(message.type).toBe('SYSTEM_EVENT');
  });

  it('deve lançar erro quando o identificador do grupo for vazio', () => {
    expect(() => {
      new GroupMessage({
        groupId: '  ',
        authorName: 'João Gabriel',
        content: 'Mensagem de teste'
      });
    }).toThrow('O identificador do grupo é obrigatório.');
  });

  it('deve lançar erro quando o nome do autor for vazio', () => {
    expect(() => {
      new GroupMessage({
        groupId: 'grupo-123',
        authorName: '',
        content: 'Mensagem de teste'
      });
    }).toThrow('O nome do autor é obrigatório.');
  });

  it('deve lançar erro quando o conteúdo da mensagem for vazio', () => {
    expect(() => {
      new GroupMessage({
        groupId: 'grupo-123',
        authorName: 'Viktor Trawinski',
        content: '   '
      });
    }).toThrow('O conteúdo da mensagem é obrigatório.');
  });

  it('deve lançar erro quando o tipo da mensagem for inválido', () => {
    expect(() => {
      new GroupMessage({
        groupId: 'grupo-123',
        authorName: 'Giuseppe Nunes',
        content: 'Mensagem de teste',
        type: 'TIPO_INVALIDO' as any
      });
    }).toThrow('O tipo da mensagem deve ser USER ou SYSTEM_EVENT.');
  });
});
