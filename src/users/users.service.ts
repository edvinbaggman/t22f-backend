import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Users } from './model/users.model';
import { CreateUsersDto } from './dto/create-users.dto';
import { CreatePlayersDto } from './dto/create-players.dto';
import { Players } from './interface/players.interface';
// import { Tournament } from 'src/tournaments/entities/tournament.entity';

@Injectable()
export class UsersService {
  private readonly firestore = admin.firestore();

  async findAll(): Promise<Users[]> {
    const snapshot = await this.firestore.collection('users').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Users[];
  }

  async createUser(user: CreateUsersDto): Promise<Users> {
    const newUser = { ...user, players: {} }; // to add an empty array of players
    const docRef = await this.firestore.collection('users').add(newUser);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Users;
  }

  async createPlayer(
    userId: string,
    player: CreatePlayersDto,
  ): Promise<Players> {
    const playerId = this.firestore.collection('players').doc().id;
    // console.log(player); // For debbuging
    const newPlayer = {
      [playerId]: {
        name: player.name,
        id: playerId,
        stats: [],
      },
    };
    // console.log(newPlayer); // For debbuging
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    // const userData = userDoc.data(); // For debbuging
    // console.log(userData);
    await userRef.set(
      {
        players: newPlayer,
      },
      { merge: true },
    );
    return newPlayer;
  }

  async getPlayers(userId: string): Promise<string[]> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    // console.log(userData);
    const playerRefs = userData.players;
    const playerNames = Object.values(playerRefs).map(
      (player: any) => player.name,
    );
    // console.log(playerNames);

    return playerNames;
  }

  async renamePlayer(
    userId: string,
    playerId: string,
    renamePlayerDto: CreatePlayersDto,
  ): Promise<any> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const fieldPath = `players.${playerId}.name`;
    console.log(fieldPath);

    await userRef.update({
      [fieldPath]: renamePlayerDto.name,
    });
    return renamePlayerDto;
  }

  async createTournament(userId: string, playerId: string): Promise<any> {
    const TournamentsId = this.firestore.collection('tournaments').doc().id;
    const newStat = {
      [TournamentsId]: {
        games: 0,
        id: TournamentsId,
        won: 0,
      },
    };
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    console.log(userDoc.data());
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    if (!userData.players || !userData.players[playerId]) {
      throw new Error('Player not found');
    }
    const fieldPath = `players.${playerId}.stats`;
    console.log(newStat);
    await userRef.update({
      [fieldPath]: newStat,
    });
    return newStat;
  }

  // udpdate games and won [TO CHECK]
  async updateTournament(
    userId: string,
    playerId: string,
    tournamentId: string,
    games: number,
    won: number,
  ): Promise<any> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    if (!userData.players || !userData.players[playerId]) {
      throw new Error('Player not found');
    }
    const fieldPath = `players.${playerId}.stats.${tournamentId}`;
    await userRef.update({
      [fieldPath]: {
        games,
        won,
      },
    });
    return { games, won };
  }

  // get user by id [TO CHECK]
  async findOne(userId: string): Promise<Users> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() } as Users;
  }

  // UPDAte name and email of user [TO CHECK]
  async updateUser(
    userId: string,
    user: CreateUsersDto,
  ): Promise<CreateUsersDto> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    await userRef.update({
      name: user.name,
      email: user.email,
    });
    return user;
  }

  // get games and won [TO CHECK]
  // async getTournament(
  //   userId: string,
  //   playerId: string,
  //   tournamentId: string,
  // ): Promise<any> {
  //   const userRef = this.firestore.collection('users').doc(userId);
  //   const userDoc = await userRef.get();
  //   if (!userDoc.exists) {
  //     throw new Error('User not found');
  //   }
  //   const userData = userDoc.data();

  //   if (!userData.players || !userData.players[playerId]) {
  //     throw new Error('Player not found');
  //   }
  //   const fieldPath = `players.${playerId}.stats.${tournamentId}`;
  //   const tournament = await userRef.get(fieldPath);
  //   return tournament;
  // }
}

//

//

// async removePlayer(userId: string, player: UpdatePlayerDto): Promise<Users> {
//   // Did we need It ? I think remove a player from a tournemanet and non in the user's list
//   const userRef = this.firestore.collection('users').doc(userId);
//   const user = await userRef.get();
//   if (!user.exists) {
//     throw new Error('User not found');
//   }
//   const userData = user.data() as Users;

//   const index = userData.players.indexOf(player.id);
//   if (index !== -1) {
//     userData.players.splice(index, 1);
//   }
//   userData.players.push(player.id);
//   await userRef.update({ players: userData.players });
//   return userData;
// }
