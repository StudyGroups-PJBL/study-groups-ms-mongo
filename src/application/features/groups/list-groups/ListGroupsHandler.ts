import { z } from 'zod';
import { StudyGroup } from '../../../../domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const listGroupsSchema = z
  .object({
    subject: z.string().trim().optional()
  })
  .optional();

export type ListGroupsInput = z.infer<typeof listGroupsSchema>;

export class ListGroupsHandler {
  constructor(private readonly studyGroupRepository: IStudyGroupRepository) {}

  public async execute(input?: ListGroupsInput): Promise<StudyGroup[]> {
    const validated = listGroupsSchema.parse(input);
    const groups = await this.studyGroupRepository.findAll();

    if (validated?.subject) {
      const targetSubject = validated.subject.toLowerCase();
      return groups.filter((group) => group.subject.toLowerCase().includes(targetSubject));
    }

    return groups;
  }
}
