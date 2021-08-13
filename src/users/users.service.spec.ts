import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from 'src/common/enums/USER_ROLE.enum';
import { PasswordHelper } from 'src/common/utils/PasswordHelper';
import { JwtService } from 'src/jwt/jwt.service';
import { Connection, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;
  let userRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn()
  };

  const mockConnection = {
    createQueryRunner: jest.fn
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: Connection, useValue: mockConnection }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const mockCreateUserArgs: CreateUserDto = {
      email: 'fack@email.com',
      password: '123456',
      role: UserRole.Translator
    };

    const mockUser = {
      id: 1,
      email: 'fack@email.com',
      role: UserRole.Translator
    };

    it('should fail if user exists', async () => {
      userRepository.findOne?.mockReturnValueOnce(mockUser);

      const result = await service.createUser(mockCreateUserArgs);

      expect(userRepository.findOne).toHaveBeenLastCalledWith({
        email: mockCreateUserArgs.email
      });

      expect(result).toMatchObject([false, 'Email already registered']);
    });

    it('should create user if not exists', async () => {
      userRepository.findOne?.mockReturnValueOnce(undefined);
      userRepository.create?.mockReturnValueOnce(mockUser);

      const result = await service.createUser(mockCreateUserArgs);

      expect(userRepository.findOne).toHaveBeenLastCalledWith({
        email: mockCreateUserArgs.email
      });
      expect(userRepository.create).toHaveBeenLastCalledWith(
        mockCreateUserArgs
      );
      expect(userRepository.save).toHaveBeenLastCalledWith(mockUser);
      expect(result).toMatchObject([true]);
    });
  });

  describe('loginUser', () => {
    const mockLoginUserDtoArgs: LoginUserDto = {
      email: 'fack@email.com',
      password: '123456'
    };
    const mockUser = {
      id: 1,
      email: 'fack@email.com',
      password: 'fake_password',
      role: UserRole.Translator
    };
    it('should fail if user does not exist', async () => {
      userRepository.findOneOrFail?.mockRejectedValueOnce(
        new Error('Some error')
      );

      const result = await service.loginUser(mockLoginUserDtoArgs);

      expect(result).toMatchObject([false, 'Some error']);
    });

    it('should fail if user password not much', async () => {
      userRepository.findOneOrFail?.mockResolvedValueOnce(mockUser);
      PasswordHelper.validatePassword = jest.fn().mockResolvedValueOnce(false);

      const result = await service.loginUser(mockLoginUserDtoArgs);

      expect(result).toMatchObject([false, 'Invalid email/password']);
    });

    it('should success if user password  much', async () => {
      userRepository.findOneOrFail?.mockResolvedValueOnce(mockUser);
      PasswordHelper.validatePassword = jest.fn().mockResolvedValueOnce(true);
      jwtService.sign = jest.fn().mockResolvedValueOnce('fake token');

      const result = await service.loginUser(mockLoginUserDtoArgs);

      expect(result).toMatchObject([true, undefined, 'fake token']);
    });
  });

  describe('getAll', () => {
    it('should return search result', async () => {
      userRepository.find?.mockResolvedValueOnce([]);

      const result = await service.getAll();

      expect(result).toMatchObject([]);
    });
  });

  describe('getOne', () => {
    const mockUser = {
      id: 1,
      email: 'fack@email.com',
      password: 'fake_password',
      role: UserRole.Translator
    };
    it('should return undefined if no match found', async () => {
      userRepository.findOne?.mockResolvedValueOnce(undefined);

      const result = await service.getOne({
        email: 'fake@email.com'
      });

      expect(result).toBeUndefined();
    });

    it('should return 1 user if match found', async () => {
      userRepository.findOne?.mockResolvedValueOnce({
        id: 1,
        email: 'fack@email.com',
        password: 'fake_password',
        role: UserRole.Translator
      });

      const result = await service.getOne({
        email: 'fack@email.com'
      });

      expect(result).toMatchObject(mockUser);
    });
  });
});
