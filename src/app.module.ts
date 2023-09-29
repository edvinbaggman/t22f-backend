import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [FirebaseModule, TournamentsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
