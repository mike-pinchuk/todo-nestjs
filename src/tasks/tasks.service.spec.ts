import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status.enum';
import { UserEntity } from '../auth/user.entiry';
import { MockUserEntity } from '../../test/user-entity.mock';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

jest.mock('', () => {
  MockUserEntity;
});

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  getTaskById: jest.fn(),
  save: jest.fn(),
});

const mockCreateTaskDto: CreateTaskDto = {
  title: 'test title',
  description: 'test description',
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository;

  const user = new MockUserEntity() as UserEntity;
  user.id = 1;
  user.username = 'testuser';
  user.password = 'hashedpassword';
  user.salt = 'salt';
  user.tasks = [];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTaskFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'test search',
      };

      const result = await tasksService.getTasks(filters, user);

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      taskRepository.findOne.mockResolvedValue({
        title: 'Test task',
        description: 'Test description',
      });

      const result = await tasksService.getTaskById(1, user);

      expect(result).toEqual({
        title: 'Test task',
        description: 'Test description',
      });
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: user.id },
      });
    });

    it('throws an error when task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(tasksService.getTaskById(1, user)).rejects.toThrow(
        new NotFoundException('It was not found'),
      );
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.createNewTask() and returns the result', async () => {
      taskRepository.createTask.mockResolvedValue('someTask');
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      // taskRepository.createNewTask(mockCreateTaskDto, user);

      const result = await tasksService.createTask(mockCreateTaskDto, user);

      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockCreateTaskDto,
        user,
      );
      expect(result).toEqual('someTask');
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.delete() method and delete the task by id', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });

      expect(taskRepository.delete).not.toHaveBeenCalled();

      await tasksService.deleteTask(1, user);

      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: user.id,
      });
    });

    it('throws an error as task could not be found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(tasksService.deleteTask(1, user)).rejects.toThrow(
        new NotFoundException('It was not found'),
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('updates a task status', async () => {
      const save = jest.fn().mockResolvedValue(true);

      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(tasksService.getTaskById).not.toHaveBeenCalled();

      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        user,
      );

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
