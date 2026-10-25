import { randomUUID } from 'crypto';

export interface StudyGroupProps {
  id?: string;
  name: string;
  subject: string;
  description?: string;
  membersCount?: number;
  createdAt?: Date;
}

export class StudyGroup {
  public readonly id: string;
  public name: string;
  public subject: string;
  public description: string;
  public membersCount: number;
  public readonly createdAt: Date;

  constructor(props: StudyGroupProps) {
    const id = props.id !== undefined ? props.id.trim() : randomUUID();
    const name = props.name ? props.name.trim() : '';
    const subject = props.subject ? props.subject.trim() : '';
    const description = props.description ? props.description.trim() : '';
    const membersCount = props.membersCount !== undefined ? props.membersCount : 1;
    const createdAt = props.createdAt ?? new Date();

    if (!id) {
      throw new Error('StudyGroup id cannot be empty.');
    }

    if (name.length < 3) {
      throw new Error('StudyGroup name must have at least 3 characters.');
    }

    if (!subject) {
      throw new Error('StudyGroup subject is required.');
    }

    if (!Number.isInteger(membersCount) || membersCount < 1) {
      throw new Error('StudyGroup membersCount must be an integer greater than or equal to 1.');
    }

    this.id = id;
    this.name = name;
    this.subject = subject;
    this.description = description;
    this.membersCount = membersCount;
    this.createdAt = createdAt;
  }

  public addMember(): void {
    this.membersCount += 1;
  }

  public removeMember(): void {
    if (this.membersCount <= 1) {
      throw new Error('StudyGroup membersCount must be an integer greater than or equal to 1.');
    }
    this.membersCount -= 1;
  }
}
