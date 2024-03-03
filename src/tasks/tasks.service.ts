import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskEntity } from './task.entity';
import { TaskRepository } from './task.repository';
import { UserEntity } from '../auth/user.entiry';

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async getTasks(
    filterDto: GetTaskFilterDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: UserEntity,
  ): Promise<TaskEntity[]> {
    const tasks = await this.taskRepository.getTasks(filterDto, user);
    return tasks;
  }

  async getTaskById(
    id: number,
    user: UserEntity,
  ): Promise<TaskEntity | undefined> {
    const task = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!task) {
      throw new NotFoundException('It was not found');
    }

    return task;
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: UserEntity,
  ): Promise<TaskEntity> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: UserEntity): Promise<void> {
    const deletedTask = await this.taskRepository.delete({
      id,
      userId: user.id,
    });

    if (deletedTask.affected === 0) {
      throw new NotFoundException('It was not found');
    }
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: UserEntity,
  ): Promise<TaskEntity> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();

    return task;
  }
}
