import { StudyGroup } from '../../domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../domain/repositories/IStudyGroupRepository';
import { StudyGroupModel, IStudyGroupDocument } from './StudyGroupModel';

export class MongoStudyGroupRepository implements IStudyGroupRepository {
  private toDomain(doc: IStudyGroupDocument): StudyGroup {
    return new StudyGroup({
      id: doc._id,
      name: doc.name,
      subject: doc.subject,
      description: doc.description,
      membersCount: doc.membersCount,
      createdAt: doc.createdAt
    });
  }

  public async create(group: StudyGroup): Promise<StudyGroup> {
    const created = await StudyGroupModel.create({
      _id: group.id,
      name: group.name,
      subject: group.subject,
      description: group.description,
      membersCount: group.membersCount,
      createdAt: group.createdAt
    });

    return this.toDomain(created);
  }

  public async findById(id: string): Promise<StudyGroup | null> {
    const doc = await StudyGroupModel.findById(id).exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  public async findAll(): Promise<StudyGroup[]> {
    const docs = await StudyGroupModel.find().sort({ createdAt: -1 }).exec();
    return docs.map((doc: IStudyGroupDocument) => this.toDomain(doc));
  }

  public async update(group: StudyGroup): Promise<StudyGroup | null> {
    const updated = await StudyGroupModel.findByIdAndUpdate(
      group.id,
      {
        name: group.name,
        subject: group.subject,
        description: group.description,
        membersCount: group.membersCount
      },
      { new: true }
    ).exec();

    if (!updated) {
      return null;
    }

    return this.toDomain(updated);
  }

  public async delete(id: string): Promise<boolean> {
    const result = await StudyGroupModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
