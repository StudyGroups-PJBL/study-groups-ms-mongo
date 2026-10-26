import { z } from 'zod';
import { StudyGroup } from '../../../../domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const createGroupSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(3, 'StudyGroup name must have at least 3 characters.'),
  subject: z.string().trim().min(1, 'StudyGroup subject is required.'),
  description: z.string().trim().optional().default(''),
  membersCount: z.number().int().min(1).optional().default(1)
});

export type CreateGroupInput = z.input<typeof createGroupSchema>;

export class CreateGroupHandler {
  constructor(private readonly studyGroupRepository: IStudyGroupRepository) {}

  public async execute(input: CreateGroupInput): Promise<StudyGroup> {
    const validated = createGroupSchema.parse(input);
    const group = new StudyGroup({
      id: validated.id,
      name: validated.name,
      subject: validated.subject,
      description: validated.description,
      membersCount: validated.membersCount
    });

    return this.studyGroupRepository.create(group);
  }
}
