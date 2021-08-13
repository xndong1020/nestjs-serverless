import { Test, TestingModule } from '@nestjs/testing';
import { JWT_CONFIG_OPTIONS } from './constants/jwt.constants';
import { JwtService } from './jwt.service';

import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'fake-secretKey';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => true)
  };
});

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: JWT_CONFIG_OPTIONS,
          useValue: { secretKey: 'TEST_KEY', isGlobal: true }
        }
      ]
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return signed token', async () => {
      const token = await service.sign({ id: 1 });

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenLastCalledWith({ id: 1 }, 'TEST_KEY');

      expect(token).toEqual('TOKEN');
    });
  });
  describe('verify', () => {
    it('should verify token in args', async () => {
      const verified = await service.verify('some token');
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenLastCalledWith('some token', 'TEST_KEY');
      expect(verified).toEqual(true);
    });
  });
});
