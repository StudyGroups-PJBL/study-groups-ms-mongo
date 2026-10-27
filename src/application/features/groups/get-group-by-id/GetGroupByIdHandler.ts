import { z } from 'zod';
import { StudyGroup } from '../../../../domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const getGroupByIdSchema = z.object({
  id: z.string().trim().min(1, 'O identificador do grupo de estudo é obrigatório.')
});

export type GetGroupByIdInput = z.infer<typeof getGroupByIdSchema>;

export class GetGroupByIdHandler {
  constructor(private readonly studyGroupRepository: IStudyGroupRepository) {}

  public async execute(input: GetGroupByIdInput): Promise<StudyGroup> {
    const validated = getGroupByIdSchema.parse(input);
    const group = await this.studyGroupRepository.findById(validated.id);

    if (!group) {
      throw new Error('Grupo de estudo não encontrado.');
    }

    return group;
  }
}
