import { describe, it, expect } from 'vitest';
import { GroupMessage } from '../../../src/domain/entities/GroupMessage';

describe('GroupMessage Entity', () => {
  it('should create a valid USER GroupMessage', () => {
    const message = new GroupMessage({
      groupId: 'group-123',
      authorName: 'Alice',
      content: 'Hello everyone! Ready for the study session?'
    });

    expect(message.id).toBeDefined();
    expect(message.groupId).toBe('group-123');
    expect(message.authorName).toBe('Alice');
    expect(message.content).toBe('Hello everyone! Ready for the study session?');
    expect(message.type).toBe('USER');
    expect(message.createdAt).toBeInstanceOf(Date);
  });

  it('should create a valid SYSTEM_EVENT GroupMessage', () => {
    const message = new GroupMessage({
      id: 'msg-001',
      groupId: 'group-123',
      authorName: 'SYSTEM',
      content: 'User Bob joined the study group',
      type: 'SYSTEM_EVENT'
    });

    expect(message.id).toBe('msg-001');
    expect(message.type).toBe('SYSTEM_EVENT');
  });

  it('should throw an error when groupId is empty', () => {
    expect(() => {
      new GroupMessage({
        groupId: '  ',
        authorName: 'Alice',
        content: 'Hello'
      });
    }).toThrow('GroupMessage groupId is required.');
  });

  it('should throw an error when authorName is empty', () => {
    expect(() => {
      new GroupMessage({
        groupId: 'group-123',
        authorName: '',
        content: 'Hello'
      });
    }).toThrow('GroupMessage authorName is required.');
  });

  it('should throw an error when content is empty', () => {
    expect(() => {
      new GroupMessage({
        groupId: 'group-123',
        authorName: 'Alice',
        content: '   '
      });
    }).toThrow('GroupMessage content is required.');
  });

  it('should throw an error when type is invalid', () => {
    expect(() => {
      new GroupMessage({
        groupId: 'group-123',
        authorName: 'Alice',
        content: 'Hello',
        type: 'INVALID' as any
      });
    }).toThrow('GroupMessage type must be USER or SYSTEM_EVENT.');
  });
});
