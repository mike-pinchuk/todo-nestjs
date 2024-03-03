import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../auth/user.entiry';
import { InternalServerErrorException, Logger } from '@nestjs/common';

export class TaskRepository extends Repository<TaskEntity> {
  private logger = new Logger('TaskRepository');
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {
    super(
      taskRepository.target,
      taskRepository.manager,
      taskRepository.queryRunner,
    );
  }
  async createTask(
    createTaskDto: CreateTaskDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: UserEntity,
  ): Promise<TaskEntity> {
    const { title, description } = createTaskDto;

    const task = new TaskEntity();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;

    try {
      await task.save();
    } catch (error) {
      this.logger.error(`Faild to save a new task to database`, error.stack);
      throw new InternalServerErrorException();
    }

    delete task.user;
    return task;
  }

  async getTasks(
    filterDto: GetTaskFilterDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: UserEntity,
  ): Promise<TaskEntity[]> {
    const { status, search } = filterDto;
    const query = await this.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'task.title LIKE :search OR task.description LIKE :search',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();

      return tasks;
    } catch (error) {
      this.logger.error(
        `Faild to get tasks for user ${user.username}.`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
