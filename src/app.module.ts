import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Test1ctrlController } from './test1ctrl/test1ctrl.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [FirebaseModule, TournamentsModule, UsersModule],
  controllers: [AppController, Test1ctrlController],
  providers: [AppService],
})
export class AppModule {}
