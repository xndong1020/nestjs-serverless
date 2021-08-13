import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcryptjs';
import { PasswordHelper } from './PasswordHelper';

jest.mock('bcryptjs', () => {
  return {
    genSalt: jest.fn(() => 'SALT'),
    hash: jest.fn(() => 'HASHED'),
    compare: jest.fn(() => true)
  };
});

describe('PasswordHelper', () => {
  it('should be defined', () => {
    expect(PasswordHelper).toBeDefined();
  });

  it('should hash password', async () => {
    const password = await PasswordHelper.hashPassword('some text');

    expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(bcrypt.genSalt).toHaveBeenLastCalledWith(10);

    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenLastCalledWith('some text', 'SALT');

    expect(password).toEqual('HASHED');
  });

  it('should verify password', async () => {
    const verified = await PasswordHelper.validatePassword(
      'some password',
      'another password'
    );

    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenLastCalledWith(
      'some password',
      'another password'
    );

    expect(verified).toEqual(true);
  });
});
