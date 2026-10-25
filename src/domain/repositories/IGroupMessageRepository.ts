import { GroupMessage } from '../entities/GroupMessage';

export interface IGroupMessageRepository {
  create(message: GroupMessage): Promise<GroupMessage>;
  findByGroupId(groupId: string): Promise<GroupMessage[]>;
  findById(id: string): Promise<GroupMessage | null>;
  deleteByGroupId(groupId: string): Promise<void>;
}

