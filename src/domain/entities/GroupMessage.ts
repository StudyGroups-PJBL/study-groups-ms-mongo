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
      throw new Error('O identificador da mensagem não pode ser vazio.');
    }

    if (!groupId) {
      throw new Error('O identificador do grupo é obrigatório.');
    }

    if (!authorName) {
      throw new Error('O nome do autor é obrigatório.');
    }

    if (!content) {
      throw new Error('O conteúdo da mensagem é obrigatório.');
    }

    if (type !== 'USER' && type !== 'SYSTEM_EVENT') {
      throw new Error('O tipo da mensagem deve ser USER ou SYSTEM_EVENT.');
    }

    this.id = id;
    this.groupId = groupId;
    this.authorName = authorName;
    this.content = content;
    this.type = type;
    this.createdAt = createdAt;
  }
}
