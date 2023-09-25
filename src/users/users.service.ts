import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Users } from './model/users.model';
import { CreateUsersDto } from './dto/create-users.dto';
import { CreatePlayersDto } from './dto/create-players.dto';
import { Players } from './model/players.model';
import { gameRsultDto } from './dto/gameResult.dto';
import crypto from 'crypto';
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
    const playerId = crypto.randomUUID();
    // console.log(player); // For debbuging
    const newPlayer = {
      name: player.name,
      id: playerId,
      stats: {},
    };
    // console.log(newPlayer); // For debbuging
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    // const userData = userDoc.data(); // For debbuging
    // console.log(userData);
    const updateObject = {};
    updateObject[`players.${playerId}`] = newPlayer;
    await userRef.update(updateObject);

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
    // console.log(fieldPath);

    await userRef.update({
      [fieldPath]: renamePlayerDto.name,
    });
    return renamePlayerDto;
  }

  // It can add a new tournament to a player (Add in the input tournamentId and remove the generation tournamentId in the body )
  async createTournament(userId: string, playerId: string): Promise<any> {
    const TournamentsId = this.firestore.collection('tournaments').doc().id;
    const newStat = {
      games: 0,
      id: TournamentsId,
      won: 0,
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
    const fieldPath = `players.${playerId}.stats.${TournamentsId}`;
    console.log(newStat);
    await userRef.update({
      [fieldPath]: newStat,
    });
    return newStat;
  }

  // udpdate games and won of a tournament
  async addGameResult(
    userId: string,
    playerId: string,
    tournamentId: string,
    win: gameRsultDto,
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

    if (
      !userData.players[playerId].stats ||
      !userData.players[playerId].stats[tournamentId]
    ) {
      throw new Error('Stat tournament not found');
    }
    let currentGames =
      userData.players[playerId].stats[tournamentId].games || 0;
    let currentWon = userData.players[playerId].stats[tournamentId].won || 0;

    currentGames += 1;
    if (win) {
      currentWon += 1;
    }
    await userRef.update({
      [fieldPath]: {
        games: currentGames,
        won: currentWon,
      },
    });
    return { currentGames, currentWon };
  }

  // Calculate and return the number of games and won of all tournaments
  async getTotalStats(userId: string, playerId: string): Promise<any> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    if (!userData.players || !userData.players[playerId]) {
      throw new Error('Player not found');
    }

    let totalGames = 0;
    let totalWon = 0;
    for (const tournamentId in userData.players[playerId].stats) {
      if (userData.players[playerId].stats.hasOwnProperty(tournamentId)) {
        totalGames += userData.players[playerId].stats[tournamentId].games || 0;
        totalWon += userData.players[playerId].stats[tournamentId].won || 0;
      }
    }
    return {
      TotalGames: totalGames.toString(),
      TotalWon: totalWon.toString(),
    };
  }

  // get a user by id [TO CHECK]
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
