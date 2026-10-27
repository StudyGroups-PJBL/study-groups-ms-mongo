import { z } from 'zod';
import { IStudyGroupRepository } from '../../../../domain/repositories/IStudyGroupRepository';
import { IGroupMessageRepository } from '../../../../domain/repositories/IGroupMessageRepository';

export const deleteGroupSchema = z.object({
  id: z.string().trim().min(1, 'O identificador do grupo de estudo é obrigatório.')
});

export type DeleteGroupInput = z.infer<typeof deleteGroupSchema>;

export class DeleteGroupHandler {
  constructor(
    private readonly studyGroupRepository: IStudyGroupRepository,
    private readonly groupMessageRepository?: IGroupMessageRepository
  ) {}

  public async execute(input: DeleteGroupInput): Promise<void> {
    const validated = deleteGroupSchema.parse(input);
    const deleted = await this.studyGroupRepository.delete(validated.id);

    if (!deleted) {
      throw new Error('Grupo de estudo não encontrado.');
    }

    if (this.groupMessageRepository) {
      await this.groupMessageRepository.deleteByGroupId(validated.id);
    }
  }
}
