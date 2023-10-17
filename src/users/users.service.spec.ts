import '../firebase/firebase.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';

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
    const user = await service.findOne('user1');
    expect(user).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
  });
  it('should create a user', async () => {
    const newUser: CreateUsersDto = {
      name: 'Zlatan Ibrahimovic',
      email: 'zlatan.ibra.10@gmail.com',
    };
    const createdUser = await service.createUser(newUser);
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.email).toBe(newUser.email);
  });
});
