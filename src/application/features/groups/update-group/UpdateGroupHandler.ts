import { z } from 'zod';
import { StudyGroup } from '../../../../domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const updateGroupSchema = z.object({
  id: z.string().trim().min(1, 'O identificador do grupo de estudo é obrigatório.'),
  name: z.string().trim().min(3, 'O nome do grupo de estudo deve ter pelo menos 3 caracteres.').optional(),
  subject: z.string().trim().min(1, 'O assunto do grupo de estudo é obrigatório.').optional(),
  description: z.string().trim().optional(),
  membersCount: z
    .number()
    .int('A quantidade de membros deve ser um número inteiro.')
    .min(1, 'A quantidade de membros deve ser maior ou igual a 1.')
    .optional()
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

export class UpdateGroupHandler {
  constructor(private readonly studyGroupRepository: IStudyGroupRepository) {}

  public async execute(input: UpdateGroupInput): Promise<StudyGroup> {
    const validated = updateGroupSchema.parse(input);
    const existing = await this.studyGroupRepository.findById(validated.id);

    if (!existing) {
      throw new Error('Grupo de estudo não encontrado.');
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
      throw new Error('Grupo de estudo não encontrado.');
    }

    return saved;
  }
}
