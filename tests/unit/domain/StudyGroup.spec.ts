import { describe, it, expect } from 'vitest';
import { StudyGroup } from '../../../src/domain/entities/StudyGroup';

describe('StudyGroup Entity', () => {
  it('should create a valid StudyGroup with default values', () => {
    const group = new StudyGroup({
      name: 'Clean Architecture Study',
      subject: 'Software Architecture',
      description: 'Group for studying Clean Architecture and DDD'
    });

    expect(group.id).toBeDefined();
    expect(group.name).toBe('Clean Architecture Study');
    expect(group.subject).toBe('Software Architecture');
    expect(group.description).toBe('Group for studying Clean Architecture and DDD');
    expect(group.membersCount).toBe(1);
    expect(group.createdAt).toBeInstanceOf(Date);
  });

  it('should create a valid StudyGroup with provided id, membersCount and createdAt', () => {
    const createdAt = new Date('2026-10-24T19:00:00Z');
    const group = new StudyGroup({
      id: 'group-123',
      name: 'Node.js Microservices',
      subject: 'Backend Engineering',
      description: 'Event-driven microservices with RabbitMQ',
      membersCount: 5,
      createdAt
    });

    expect(group.id).toBe('group-123');
    expect(group.membersCount).toBe(5);
    expect(group.createdAt).toBe(createdAt);
  });

  it('should throw an error when name has fewer than 3 characters', () => {
    expect(() => {
      new StudyGroup({
        name: 'AB',
        subject: 'Math'
      });
    }).toThrow('StudyGroup name must have at least 3 characters.');
  });

  it('should throw an error when subject is empty', () => {
    expect(() => {
      new StudyGroup({
        name: 'Calculus I',
        subject: '   '
      });
    }).toThrow('StudyGroup subject is required.');
  });

  it('should throw an error when membersCount is less than 1', () => {
    expect(() => {
      new StudyGroup({
        name: 'Algorithms',
        subject: 'Computer Science',
        membersCount: 0
      });
    }).toThrow('StudyGroup membersCount must be an integer greater than or equal to 1.');
  });

  it('should increment and decrement membersCount respecting invariants', () => {
    const group = new StudyGroup({
      name: 'Distributed Systems',
      subject: 'Computer Science',
      membersCount: 1
    });

    group.addMember();
    expect(group.membersCount).toBe(2);

    group.removeMember();
    expect(group.membersCount).toBe(1);

    expect(() => group.removeMember()).toThrow(
      'StudyGroup membersCount must be an integer greater than or equal to 1.'
    );
  });
});
