import { randomUUID } from 'crypto';

export type MessageType = 'USER' | 'SYSTEM_EVENT';

export interface GroupMessageProps {
  id?: string;
  groupId: string;
  authorName: string;
  content: string;
  type?: MessageType;
  createdAt?: Date;
}

export class GroupMessage {
  public readonly id: string;
  public readonly groupId: string;
  public readonly authorName: string;
  public readonly content: string;
  public readonly type: MessageType;
  public readonly createdAt: Date;

  constructor(props: GroupMessageProps) {
    const id = props.id !== undefined ? props.id.trim() : randomUUID();
    const groupId = props.groupId ? props.groupId.trim() : '';
    const authorName = props.authorName ? props.authorName.trim() : '';
    const content = props.content ? props.content.trim() : '';
    const type = props.type ?? 'USER';
    const createdAt = props.createdAt ?? new Date();

    if (!id) {
      throw new Error('GroupMessage id cannot be empty.');
    }

    if (!groupId) {
      throw new Error('GroupMessage groupId is required.');
    }

    if (!authorName) {
      throw new Error('GroupMessage authorName is required.');
    }

    if (!content) {
      throw new Error('GroupMessage content is required.');
    }

    if (type !== 'USER' && type !== 'SYSTEM_EVENT') {
      throw new Error('GroupMessage type must be USER or SYSTEM_EVENT.');
    }

    this.id = id;
    this.groupId = groupId;
    this.authorName = authorName;
    this.content = content;
    this.type = type;
    this.createdAt = createdAt;
  }
}

