import { GroupMessage } from '../../domain/entities/GroupMessage';
import { IGroupMessageRepository } from '../../domain/repositories/IGroupMessageRepository';
import { GroupMessageModel, IGroupMessageDocument } from './GroupMessageModel';

export class MongoGroupMessageRepository implements IGroupMessageRepository {
  private toDomain(doc: IGroupMessageDocument): GroupMessage {
    return new GroupMessage({
      id: doc._id,
      groupId: doc.groupId,
      authorName: doc.authorName,
      content: doc.content,
      type: doc.type,
      createdAt: doc.createdAt
    });
  }

  public async create(message: GroupMessage): Promise<GroupMessage> {
    const created = await GroupMessageModel.create({
      _id: message.id,
      groupId: message.groupId,
      authorName: message.authorName,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt
    });

    return this.toDomain(created);
  }

  public async findByGroupId(groupId: string): Promise<GroupMessage[]> {
    const docs = await GroupMessageModel.find({ groupId }).sort({ createdAt: -1 }).exec();
    return docs.map((doc: IGroupMessageDocument) => this.toDomain(doc));
  }

  public async findLatest(limit = 50): Promise<GroupMessage[]> {
    const docs = await GroupMessageModel.find().sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map((doc: IGroupMessageDocument) => this.toDomain(doc));
  }

  public async findById(id: string): Promise<GroupMessage | null> {
    const doc = await GroupMessageModel.findById(id).exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  public async deleteByGroupId(groupId: string): Promise<void> {
    await GroupMessageModel.deleteMany({ groupId }).exec();
  }
}
