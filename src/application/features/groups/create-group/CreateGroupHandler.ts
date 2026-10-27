import { z } from 'zod';
import { StudyGroup } from '../../../../domain/entities/StudyGroup';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';

export const createGroupSchema = z.object({
  id: z.string().trim().min(1, 'O identificador do grupo de estudo não pode ser vazio.').optional(),
  name: z.string().trim().min(3, 'O nome do grupo de estudo deve ter pelo menos 3 caracteres.'),
  subject: z.string().trim().min(1, 'O assunto do grupo de estudo é obrigatório.'),
  description: z.string().trim().optional().default(''),
  membersCount: z
    .number()
    .int('A quantidade de membros deve ser um número inteiro.')
    .min(1, 'A quantidade de membros deve ser maior ou igual a 1.')
    .optional()
    .default(1)
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
