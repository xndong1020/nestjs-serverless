import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { getConnection, Repository } from 'typeorm';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userRepository: Repository<User>;
  const GRAPHQL_ENDPOINT = '/graphql';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    userRepository = module.get('UserRepository');
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  afterEach(async () => {});

  describe('create account', () => {
    it('should create account', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation createUser($newUser: CreateUserDto!) 
                    { createUser(newUser: $newUser) 
                      {  
                        error
                        ok 
                      }
                    }`,
          variables: `{
            "newUser": {
             "email": "translator07@test.com",
              "password": "123456",
              "role": "Translator"
            }
          }`
        })
        .expect(200)
        .expect((response) => {
          const { ok, error } = response.body.data.createUser;
          expect(ok).toEqual(true);
          expect(error).toBeNull();
        });
    });
    it('should fail if account already exists', async () => {
      const user = await userRepository.findOne({
        email: 'translator07@test.com'
      });
      expect(user!.email).toEqual('translator07@test.com');
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation createUser($newUser: CreateUserDto!) 
                  { createUser(newUser: $newUser) 
                    {  
                      error
                      ok 
                    }
                  }`,
          variables: `{
          "newUser": {
           "email": "translator07@test.com",
            "password": "123456",
            "role": "Translator"
          }
        }`
        })
        .expect(200)
        .expect((response) => {
          const { ok, error } = response.body.data.createUser;
          expect(ok).toEqual(false);
          expect(error).toContain('Email already registered');
        });
    });

    describe('login user', () => {
      it('should fail if login with wrong username', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `mutation loginUser($loginUser: LoginUserDto!) {
                    loginUser(loginUser:$loginUser) { 
                      error
                      ok
                      token
                    }
                  }`,
            variables: `{
              "loginUser": {
                "email": "non-exist@test.com",
                "password": "123456"
              }
            }`
          })
          .expect(200)
          .expect((response) => {
            const { ok, error, token } = response.body.data.loginUser;
            expect(ok).toEqual(false);
            expect(token).toBeNull();
            expect(error).toContain(
              `Could not find any entity of type "User" matching`
            );
          });
      });

      it('should fail if login with wrong password', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `mutation loginUser($loginUser: LoginUserDto!) {
                    loginUser(loginUser:$loginUser) { 
                      error
                      ok
                      token
                    }
                  }`,
            variables: `{
              "loginUser": {
                "email": "translator07@test.com",
                "password": "wrong_password"
              }
            }`
          })
          .expect(200)
          .expect((response) => {
            const { ok, error, token } = response.body.data.loginUser;
            expect(ok).toEqual(false);
            expect(token).toBeNull();
            expect(error).toContain(`Invalid email/password`);
          });
      });

      it('should login with correct credential', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `mutation loginUser($loginUser: LoginUserDto!) {
                    loginUser(loginUser:$loginUser) { 
                      error
                      ok
                      token
                    }
                  }`,
            variables: `{
              "loginUser": {
                "email": "translator07@test.com",
                "password": "123456"
              }
            }`
          })
          .expect(200)
          .expect((response) => {
            const { ok, error, token } = response.body.data.loginUser;
            expect(ok).toEqual(true);
            expect(error).toBeNull();
            expect(token).toEqual(expect.any(String));
            jwtToken = token; // for 'me'
          });
      });
    });

    describe('me', () => {
      it('should fail with invalid token', async () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('Authorization', `Bearer wrong_token`)
          .send({
            query: `query me { me { email  } } `
          })
          .expect(401)
          .expect((response) => {
            expect(response.body.message).toContain('Unauthorized');
          });
      });

      it('should success with correct token', async () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            query: `{ me { email } }`
          })
          .expect(200)
          .expect((response) => {
            const {
              data: { me }
            } = response.body;
            expect(me.email).toContain('translator07@test.com');
          });
      });
    });

    describe('get users', () => {
      it('should return the user just created', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            query: `query getUsers {
              getUsers {
                email
              }
            }`
          })
          .expect(200)
          .expect((response) => {
            const users = response.body.data.getUsers as User[];
            expect(users).toMatchObject([{ email: 'translator07@test.com' }]);
          });
      });
    });
  });
});
