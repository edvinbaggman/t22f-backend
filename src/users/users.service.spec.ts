import '../firebase/firebase.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Users } from './model/users.model';
import { RenameUserDto } from './dto/rename-users.dto';
// import { CreateUsersDto } from './dto/create-users.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user', async () => {
    const user = await service.findOne('1');
    expect(user).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
  });

  it('should return an array of users', async () => {
    const result = [];
    jest.spyOn(service, 'findAll').mockImplementation(async () => result);
    expect(await service.findAll()).toBe(result);
  });

  // it('should create a user', async () => {
  //   const newUser: CreateUsersDto = {
  //     name: 'John Doe',
  //     email: 'john.doe@example.com',
  //   };
  //   const createdUser = await service.createUser(newUser);
  //   expect(createdUser.name).toBe(newUser.name);
  //   expect(createdUser.email).toBe(newUser.email);
  // });

  it('should create a user', async () => {
    const result: Users = {
      name: 'test',
      email: 'test@example.com',
      players: [],
    };
    jest.spyOn(service, 'createUser').mockImplementation(async () => result);
    expect(await service.createUser(result)).toBe(result);
  });

  it('should rename a user', async () => {
    const userNames: RenameUserDto = {
      name: 'Alex',
    };
    const result: Users = {
      name: 'test',
      email: 'john.doe@example.com',
      players: [],
    };
    jest.spyOn(service, 'renameUser').mockImplementation(async () => result);
    expect(await service.renameUser('1', userNames)).toBe(result);
  });
});
