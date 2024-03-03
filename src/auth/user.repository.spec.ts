import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './user.entiry';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockCredantialsDto = {
  username: 'TestUsername',
  password: 'TestPassword',
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
      ],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('successfully signs up the user', async () => {
      save.mockResolvedValue(undefined);

      expect(userRepository.signUp(mockCredantialsDto)).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' });

      expect(userRepository.signUp(mockCredantialsDto)).rejects.toThrow(
        new ConflictException('Username already exists'),
      );
    });

    it('throws an internal server error exception ', async () => {
      save.mockRejectedValue({ code: '11111' }); //unhandled error code

      expect(userRepository.signUp(mockCredantialsDto)).rejects.toThrow(
        new InternalServerErrorException(),
      );
    });
  });

  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();

      user = new UserEntity();
      user.username = 'TestUsername';
      user.validatePassword = jest.fn();
    });

    it('returns the username as validation is successfull', async () => {
      userRepository.findOne.mockResolvedValue(user);

      user.validatePassword.mockResolvedValue(true);

      const result =
        await userRepository.validateUserPassword(mockCredantialsDto);

      expect(result).toEqual('TestUsername');
    });

    it('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result =
        await userRepository.validateUserPassword(mockCredantialsDto);

      expect(result).toBeNull();
      expect(user.validatePassword).not.toHaveBeenCalled();
    });

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      const result =
        await userRepository.validateUserPassword(mockCredantialsDto);

      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');

      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await userRepository.hashPassword(
        'testPassword',
        'testSalt',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual('testHash');
    });
  });
});
