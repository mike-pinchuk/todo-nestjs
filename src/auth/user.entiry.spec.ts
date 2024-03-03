import { UserEntity } from './user.entiry';
import * as bcrypt from 'bcrypt';

describe('User entity', () => {
  let user: UserEntity;

  beforeEach(() => {
    user = new UserEntity();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    bcrypt.hash = jest.fn();
  });
  describe('validatePassword', () => {
    it('returns true as password as valid', async () => {
      bcrypt.hash.mockReturnValue('testPassword');

      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('12345');

      expect(bcrypt.hash).toHaveBeenCalledWith('12345', 'testSalt');
      expect(result).toEqual(true);
    });

    it('returns false as password as invalid', async () => {
      bcrypt.hash.mockReturnValue('wrongPassword');

      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('wrongPassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('wrongPassword', 'testSalt');
      expect(result).toEqual(false);
    });
  });
});
