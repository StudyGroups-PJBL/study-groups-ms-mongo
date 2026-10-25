import { StudyGroup } from '../entities/StudyGroup';

export interface IStudyGroupRepository {
  create(group: StudyGroup): Promise<StudyGroup>;
  findById(id: string): Promise<StudyGroup | null>;
  findAll(): Promise<StudyGroup[]>;
  update(group: StudyGroup): Promise<StudyGroup | null>;
  delete(id: string): Promise<boolean>;
}
