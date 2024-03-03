import { TaskEntity } from '../src/tasks/task.entity';

export class MockUserEntity {
  id: number;
  username: string;
  password: string;
  salt: string;
  tasks: TaskEntity[];

  async validatePassword(password: string): Promise<boolean> {
    // Implement a simple validation logic for testing purposes
    return password === this.password;
  }
}
