import { z } from 'zod';
import { StudyGroup } from '../../../../domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const updateGroupSchema = z.object({
  id: z.string().trim().min(1, 'StudyGroup id is required.'),
  name: z.string().trim().min(3, 'StudyGroup name must have at least 3 characters.').optional(),
  subject: z.string().trim().min(1, 'StudyGroup subject is required.').optional(),
  description: z.string().trim().optional(),
  membersCount: z.number().int().min(1).optional()
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

export class UpdateGroupHandler {
  constructor(private readonly studyGroupRepository: IStudyGroupRepository) {}

  public async execute(input: UpdateGroupInput): Promise<StudyGroup> {
    const validated = updateGroupSchema.parse(input);
    const existing = await this.studyGroupRepository.findById(validated.id);

    if (!existing) {
      throw new Error('StudyGroup not found.');
    }

    const updatedEntity = new StudyGroup({
      id: existing.id,
      name: validated.name ?? existing.name,
      subject: validated.subject ?? existing.subject,
      description: validated.description ?? existing.description,
      membersCount: validated.membersCount ?? existing.membersCount,
      createdAt: existing.createdAt
    });

    const saved = await this.studyGroupRepository.update(updatedEntity);
    if (!saved) {
      throw new Error('StudyGroup not found.');
    }

    return saved;
  }
}
