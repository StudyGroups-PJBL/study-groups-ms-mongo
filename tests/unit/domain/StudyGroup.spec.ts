import { describe, it, expect } from 'vitest';
import { StudyGroup } from '../../../src/domain/entities/StudyGroup';

describe('Entidade StudyGroup (Grupo de Estudo)', () => {
  it('deve criar um grupo de estudo válido com valores padrão', () => {
    const group = new StudyGroup({
      name: 'Grupo de Arquitetura Limpa',
      subject: 'Arquitetura de Software',
      description: 'Grupo dedicado ao estudo de Clean Architecture e DDD'
    });

    expect(group.id).toBeDefined();
    expect(group.name).toBe('Grupo de Arquitetura Limpa');
    expect(group.subject).toBe('Arquitetura de Software');
    expect(group.description).toBe('Grupo dedicado ao estudo de Clean Architecture e DDD');
    expect(group.membersCount).toBe(1);
    expect(group.createdAt).toBeInstanceOf(Date);
  });

  it('deve criar um grupo de estudo válido com id, quantidade de membros e data informados', () => {
    const createdAt = new Date('2026-10-24T19:00:00Z');
    const group = new StudyGroup({
      id: 'grupo-123',
      name: 'Microsserviços com Node.js',
      subject: 'Engenharia de Backend',
      description: 'Arquitetura orientada a eventos com RabbitMQ e MongoDB',
      membersCount: 5,
      createdAt
    });

    expect(group.id).toBe('grupo-123');
    expect(group.membersCount).toBe(5);
    expect(group.createdAt).toBe(createdAt);
  });

  it('deve lançar erro quando o nome tiver menos de 3 caracteres', () => {
    expect(() => {
      new StudyGroup({
        name: 'AB',
        subject: 'Matemática Discreta'
      });
    }).toThrow('O nome do grupo de estudo deve ter pelo menos 3 caracteres.');
  });

  it('deve lançar erro quando o assunto for vazio', () => {
    expect(() => {
      new StudyGroup({
        name: 'Cálculo Diferencial I',
        subject: '   '
      });
    }).toThrow('O assunto do grupo de estudo é obrigatório.');
  });

  it('deve lançar erro quando a quantidade de membros for menor que 1', () => {
    expect(() => {
      new StudyGroup({
        name: 'Estruturas de Dados',
        subject: 'Ciência da Computação',
        membersCount: 0
      });
    }).toThrow('A quantidade de membros deve ser um número inteiro maior ou igual a 1.');
  });

  it('deve incrementar e decrementar a quantidade de membros respeitando as invariantes', () => {
    const group = new StudyGroup({
      name: 'Sistemas Distribuídos',
      subject: 'Ciência da Computação',
      membersCount: 1
    });

    group.addMember();
    expect(group.membersCount).toBe(2);

    group.removeMember();
    expect(group.membersCount).toBe(1);

    expect(() => group.removeMember()).toThrow(
      'A quantidade de membros deve ser um número inteiro maior ou igual a 1.'
    );
  });
});
