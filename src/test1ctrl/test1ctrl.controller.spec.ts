import { Test, TestingModule } from '@nestjs/testing';
import { Test1ctrlController } from './test1ctrl.controller';

describe('Test1ctrlController', () => {
  let controller: Test1ctrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Test1ctrlController],
    }).compile();

    controller = module.get<Test1ctrlController>(Test1ctrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
