import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entiry';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JWT Strategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('validates and returns user based on JWT payload', async () => {
      const user = new UserEntity();
      user.username = 'Test user';

      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate({ username: 'Test user' });

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'Test user' },
      });
    });

    it('throws unauthorized exception as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      expect(jwtStrategy.validate({ username: 'Test user' })).rejects.toThrow(
        new UnauthorizedException(),
      );
    });
  });
});
